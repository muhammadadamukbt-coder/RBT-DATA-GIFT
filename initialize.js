/* =========================================================
   RBT DATA GIFT
   PAYSTACK INITIALIZE TRANSACTION
   VERCEL FUNCTION
========================================================= */

const PACKAGES = {
    1: {
        price: 999,
        data: "7GB",
        duration: "Monthly"
    },

    2: {
        price: 4999,
        data: "35GB",
        duration: "Monthly"
    },

    3: {
        price: 9999,
        data: "65GB",
        duration: "Monthly"
    },

    4: {
        price: 14999,
        data: "100GB",
        duration: "2 Months"
    },

    5: {
        price: 19999,
        data: "140GB",
        duration: "2 Months"
    },

    6: {
        price: 24999,
        data: "180GB",
        duration: "2 Months"
    },

    7: {
        price: 29999,
        data: "220GB",
        duration: "3 Months"
    },

    8: {
        price: 34999,
        data: "260GB",
        duration: "6 Months"
    },

    9: {
        price: 39999,
        data: "299GB",
        duration: "10 Months"
    },

    10: {
        price: 49999,
        data: "350GB",
        duration: "Yearly"
    }
};


/* =========================================================
   ALLOWED NETWORKS
========================================================= */

const ALLOWED_NETWORKS = [
    "MTN",
    "Airtel",
    "Glo",
    "9mobile"
];


/* =========================================================
   CORS HEADERS
========================================================= */

function corsHeaders() {

    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type",
        "Content-Type":
            "application/json"
    };
}


/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status: status,
            headers: corsHeaders()
        }
    );
}


/* =========================================================
   VERCEL FUNCTION
========================================================= */

export default {

    async fetch(request) {

        /* -------------------------
           CORS PREFLIGHT
        ------------------------- */

        if (request.method === "OPTIONS") {

            return new Response(
                null,
                {
                    status: 204,
                    headers: corsHeaders()
                }
            );

        }


        /* -------------------------
           ONLY POST
        ------------------------- */

        if (request.method !== "POST") {

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Only POST requests are allowed"
                },
                405
            );

        }


        try {

            /* -------------------------
               SECRET KEY
            ------------------------- */

            const secretKey =
                process.env.PAYSTACK_SECRET_KEY;


            if (!secretKey) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Paystack secret key is not configured"
                    },
                    500
                );

            }


            /* -------------------------
               READ REQUEST BODY
            ------------------------- */

            const body =
                await request.json();


            const {
                packageId,
                fullName,
                phone,
                network,
                email
            } = body;


            /* -------------------------
               VALIDATE PACKAGE
            ------------------------- */

            const id =
                Number(packageId);


            const selectedPackage =
                PACKAGES[id];


            if (!selectedPackage) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Invalid package"
                    },
                    400
                );

            }


            /* -------------------------
               VALIDATE NAME
            ------------------------- */

            if (
                typeof fullName !== "string" ||
                fullName.trim().length < 2
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Enter a valid full name"
                    },
                    400
                );

            }


            /* -------------------------
               VALIDATE PHONE
            ------------------------- */

            const cleanPhone =
                String(phone || "")
                    .replace(/\D/g, "");


            if (
                cleanPhone.length < 10 ||
                cleanPhone.length > 15
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Enter a valid phone number"
                    },
                    400
                );

            }


            /* -------------------------
               VALIDATE NETWORK
            ------------------------- */

            if (
                !ALLOWED_NETWORKS.includes(
                    network
                )
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Invalid network"
                    },
                    400
                );

            }


            /* -------------------------
               PAYSTACK EMAIL
            ------------------------- */

            let customerEmail =
                typeof email === "string"
                    ? email.trim()
                    : "";


            /*
               Paystack requires an email
               during transaction initialization.

               If the customer does not provide
               one, create a technical email
               using the phone number.
            */

            if (!customerEmail) {

                customerEmail =
                    `${cleanPhone}@rbtdata.gift`;

            }


            /* -------------------------
               BASIC EMAIL CHECK
            ------------------------- */

            if (
                !customerEmail.includes("@")
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Enter a valid email address"
                    },
                    400
                );

            }


            /* -------------------------
               UNIQUE REFERENCE
            ------------------------- */

            const reference =
                `RBT-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`;


            /* -------------------------
               PAYSTACK INITIALIZE
               
               Paystack amount is in
               the lowest currency unit.

               ₦999 = 99900 kobo
            ------------------------- */

            const paystackResponse =
                await fetch(
                    "https://api.paystack.co/transaction/initialize",
                    {
                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${secretKey}`,

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email:
                                customerEmail,

                            amount:
                                String(
                                    selectedPackage.price * 100
                                ),

                            currency:
                                "NGN",

                            reference:
                                reference,

                            metadata: {

                                business:
                                    "RBT DATA GIFT",

                                packageId:
                                    id,

                                data:
                                    selectedPackage.data,

                                duration:
                                    selectedPackage.duration,

                                price:
                                    selectedPackage.price,

                                fullName:
                                    fullName.trim(),

                                phone:
                                    cleanPhone,

                                network:
                                    network

                            }

                        })

                    }
                );


            const result =
                await paystackResponse.json();


            /* -------------------------
               PAYSTACK ERROR
            ------------------------- */

            if (
                !paystackResponse.ok ||
                !result.status ||
                !result.data
            ) {

                console.error(
                    "Paystack initialization failed:",
                    result
                );


                return jsonResponse(
                    {
                        success: false,

                        message:
                            result.message ||
                            "Unable to initialize payment"
                    },
                    400
                );

            }


            /* -------------------------
               SUCCESS
            ------------------------- */

            return jsonResponse({

                success: true,

                message:
                    "Payment initialized",

                access_code:
                    result.data.access_code,

                authorization_url:
                    result.data.authorization_url,

                reference:
                    result.data.reference

            });

        }

        catch (error) {

            console.error(
                "Initialize function error:",
                error
            );


            return jsonResponse(
                {
                    success: false,
                    message:
                        "Payment initialization failed"
                },
                500
            );

        }

    }

};