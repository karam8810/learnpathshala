import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const serviceClient = createClient(url, serviceKey);
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { seriesId } = await req.json();
    if (!seriesId) return new Response(JSON.stringify({ error: "Series ID required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: transaction, error: transactionError } = await userClient.rpc("create_mock_series_payment", { p_series_id: seriesId });
    if (transactionError || !transaction) return new Response(JSON.stringify({ error: "Could not start payment" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: settings } = await serviceClient.from("payment_settings").select("merchant_key, merchant_salt, test_mode").eq("id", 1).maybeSingle();
    if (!settings?.merchant_key || !settings.merchant_salt) return new Response(JSON.stringify({ error: "Payment gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: profile } = await serviceClient.from("profiles").select("full_name, email").eq("id", authData.user.id).maybeSingle();
    const txnid = transaction.txnid as string;
    const amount = String(transaction.amount);
    const productinfo = String(transaction.series_title || "Mock Test Series");
    const firstname = profile?.full_name?.split(" ")[0] || "Student";
    const email = profile?.email || authData.user.email || "";
    const hashString = `${settings.merchant_key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${settings.merchant_salt}`;
    const hashBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hashString));
    const hash = Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const payuUrl = settings.test_mode ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";
    const configuredSiteUrl = Deno.env.get("SITE_URL");
    const requestOrigin = req.headers.get("origin");
    let appOrigin = "";
    try {
      const parsedOrigin = new URL(configuredSiteUrl || requestOrigin || "");
      if (parsedOrigin.protocol === "http:" || parsedOrigin.protocol === "https:") appOrigin = parsedOrigin.origin;
    } catch {
      appOrigin = "";
    }
    const callbackQuery = appOrigin ? `?return_to=${encodeURIComponent(appOrigin)}` : "";
    const callback = `${url}/functions/v1/payu-webhook${callbackQuery}`;
    return new Response(JSON.stringify({ key: settings.merchant_key, txnid, amount, productinfo, firstname, email, hash, payu_url: payuUrl, surl: callback, curl: callback }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Payment initialization failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
