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
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    let bodyData: Record<string, string>;

    const contentType = req.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      bodyData = await req.json();
    } else {
      const formData = await req.formData();
      bodyData = Object.fromEntries(formData.entries());
    }

    const txnid = bodyData.txnid || bodyData.mihpayid || "";
    const status = (bodyData.status || "").toLowerCase();
    const mihpayid = bodyData.mihpayid || bodyData.payu_payment_id || "";
    const receivedHash = bodyData.hash || "";

    if (!txnid) {
      return new Response(JSON.stringify({ error: "Missing transaction ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get PayU settings
    const { data: settings } = await serviceClient
      .from("payment_settings")
      .select("merchant_key, merchant_salt")
      .eq("id", 1)
      .maybeSingle();

    if (!settings || !settings.merchant_key) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify hash: PayU sends sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const hashString = `${settings.merchant_salt}|${status}|||||||||||${bodyData.email || ""}|${bodyData.firstname || ""}|${bodyData.productinfo || ""}|${bodyData.amount || ""}|${txnid}|${settings.merchant_key}`;

    const hashBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hashString));
    const computedHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isVerified = computedHash === receivedHash;
    const isSuccess = status === "success";

    const paymentResponse = {
      ...bodyData,
      hash_verified: isVerified,
      verified_at: new Date().toISOString(),
    };

    const callbackStatus = isVerified && isSuccess ? "success" : (isSuccess ? "failed" : status);
    const isSeriesPayment = txnid.startsWith("MTS");
    const rpcName = isSeriesPayment ? "complete_mock_series_payment" : "complete_payment_enrollment";
    const { error: completionError } = isSeriesPayment
      ? await serviceClient.rpc(rpcName, {
          p_txnid: txnid,
          p_status: callbackStatus,
          p_payu_payment_id: mihpayid,
          p_payu_response: paymentResponse,
        })
      : await serviceClient.rpc(rpcName, {
          p_txnid: txnid,
          p_status: callbackStatus,
          p_payu_payment_id: mihpayid,
          p_payu_response: paymentResponse,
        });
    if (completionError) console.error("Payment completion error:", completionError.message);

    const configuredSiteUrl = Deno.env.get("SITE_URL");
    const callbackReturnTo = new URL(req.url).searchParams.get("return_to");
    let siteUrl = "";
    try {
      const parsedSiteUrl = new URL(configuredSiteUrl || callbackReturnTo || "");
      if (parsedSiteUrl.protocol === "http:" || parsedSiteUrl.protocol === "https:") siteUrl = parsedSiteUrl.origin;
    } catch {
      siteUrl = "";
    }
    const destination = isSeriesPayment ? "/dashboard/student/mock-tests" : "/dashboard/student/courses";
    const redirectUrl = siteUrl
      ? `${siteUrl}${destination}?payment=${isVerified && isSuccess ? "success" : "failed"}&txnid=${encodeURIComponent(txnid)}`
      : "";
    const continueMarkup = redirectUrl
      ? `<a href="${redirectUrl}">Continue to Dashboard</a>`
      : `<p>Return to the academy tab to continue.</p>`;
    const redirectScript = redirectUrl
      ? `setTimeout(function() { window.location.href = "${redirectUrl}"; }, 3000);`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment ${isVerified && isSuccess ? "Successful" : "Failed"}</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 60px 20px; background: #f8fafc; }
    .card { max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: ${isVerified && isSuccess ? "#059669" : "#dc2626"}; margin-bottom: 8px; }
    p { color: #64748b; margin-bottom: 24px; }
    a { display: inline-block; padding: 12px 28px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isVerified && isSuccess ? "✅" : "❌"}</div>
    <h1>${isVerified && isSuccess ? "Payment Successful!" : "Payment Failed"}</h1>
    <p>${isVerified && isSuccess ? "Your enrollment is being processed. You will be redirected shortly." : "Your payment could not be completed. Please try again."}</p>
    ${continueMarkup}
  </div>
  <script>${redirectScript}</script>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
