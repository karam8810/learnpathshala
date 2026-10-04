import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return new Response(JSON.stringify({ error: "Course ID required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payment transaction via RPC (uses caller's auth)
    const { data: txnData, error: txnError } = await userClient.rpc("create_payment_transaction", {
      p_course_id: courseId,
    });

    if (txnError) {
      return new Response(JSON.stringify({ error: txnError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get PayU settings from database (service role bypasses RLS)
    const { data: settings, error: settingsError } = await serviceClient
      .from("payment_settings")
      .select("merchant_key, merchant_salt, test_mode")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError || !settings || !settings.merchant_key) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get student email and name
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", userData.user.id)
      .maybeSingle();

    const txn = txnData as any;
    const merchantKey = settings.merchant_key;
    const merchantSalt = settings.merchant_salt;
    const isTest = settings.test_mode;

    // Build PayU hash: sha512(key|txnid|amount|productinfo|firstname|email||||||||||||salt)
    const productinfo = txn.course_title || "Course Enrollment";
    const firstname = profile?.full_name?.split(" ")[0] || "Student";
    const email = profile?.email || userData.user.email || "";
    const amount = String(txn.amount);
    const txnid = txn.txnid;

    const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;

    const hashBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hashString));
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const payuBaseUrl = isTest
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";

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
    const surl = `${supabaseUrl}/functions/v1/payu-webhook${callbackQuery}`;
    const curl = `${supabaseUrl}/functions/v1/payu-webhook${callbackQuery}`;

    return new Response(JSON.stringify({
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      key: merchantKey,
      payu_url: payuBaseUrl,
      surl,
      curl,
      test_mode: isTest,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Payment initialization failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
