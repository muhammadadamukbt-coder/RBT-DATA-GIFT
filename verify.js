export default async (request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Only GET requests are allowed."
      }),
      {
        status: 405,
        headers
      }
    );
  }

  try {
    const secretKey = Netlify.env.get("PAYSTACK_SECRET_KEY");

    if (!secretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "PAYSTACK_SECRET_KEY is not configured."
        }),
        {
          status: 500,
          headers
        }
      );
    }

    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment reference is required."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            data.message || "Unable to verify payment."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    const transaction = data.data;

    return new Response(
      JSON.stringify({
        success: true,
        paid: transaction.status === "success",
        status: transaction.status,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        paidAt: transaction.paid_at,
        channel: transaction.channel,

        customer: {
          email: transaction.customer?.email || ""
        }
      }),
      {
        status: 200,
        headers
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error while verifying payment."
      }),
      {
        status: 500,
        headers
      }
    );
  }
};