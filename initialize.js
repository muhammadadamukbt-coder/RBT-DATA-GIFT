const PACKAGES = {
  1: { data: "7GB", duration: "Monthly", price: 999 },
  2: { data: "35GB", duration: "Monthly", price: 4999 },
  3: { data: "65GB", duration: "Monthly", price: 9999 },
  4: { data: "100GB", duration: "2 Months", price: 14999 },
  5: { data: "140GB", duration: "2 Months", price: 19999 },
  6: { data: "180GB", duration: "2 Months", price: 24999 },
  7: { data: "220GB", duration: "3 Months", price: 29999 },
  8: { data: "260GB", duration: "6 Months", price: 34999 },
  9: { data: "299GB", duration: "10 Months", price: 39999 },
  10: { data: "350GB", duration: "Yearly", price: 49999 }
};

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"];

export default async (request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Only POST requests are allowed."
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

    const body = await request.json();

    const {
      packageId,
      fullName,
      phone,
      network,
      email
    } = body;

    const selectedPackage = PACKAGES[packageId];

    if (!selectedPackage) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid package selected."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    if (!fullName || fullName.trim().length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please enter your full name."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please enter a valid phone number."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    if (!NETWORKS.includes(network)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please select a valid network."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    const customerEmail =
      String(email || "").trim() ||
      `${cleanPhone}@rbtdata.gift`;

    const reference =
      `RBT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const payload = {
      email: customerEmail,
      amount: selectedPackage.price * 100,
      currency: "NGN",
      reference,

      metadata: {
        business: "RBT DATA GIFT",
        packageId,
        data: selectedPackage.data,
        duration: selectedPackage.duration,
        price: selectedPackage.price,
        fullName: fullName.trim(),
        phone: cleanPhone,
        network
      }
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            data.message || "Unable to initialize payment."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment initialized successfully.",
        access_code: data.data.access_code,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
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
        message: "Server error while initializing payment."
      }),
      {
        status: 500,
        headers
      }
    );
  }
};