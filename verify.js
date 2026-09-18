/* =========================================================
   RBT DATA GIFT
   PAYSTACK VERIFY TRANSACTION
   VERCEL FUNCTION
========================================================= */


/* =========================================================
   CORS HEADERS
========================================================= */

function corsHeaders() {

    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
            "GET, OPTIONS",
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
           ONLY GET
        ------------------------- */

        if (request.method !== "GET") {

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Only GET requests are allowed"
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
               GET REFERENCE
            ------------------------- */

            const url =
                new URL(request.url);


            const reference =
                url.searchParams.get(
                    "reference"
                );


            if (!reference) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Transaction reference is required"
                    },
                    400
                );

            }


            /* -------------------------
               BASIC REFERENCE CHECK
            ------------------------- */

            if (
                !/^[a-zA-Z0-9_.=-]+$/.test(
                    reference
                )
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Invalid transaction reference"
                    },
                    400
                );

            }


            /* -------------------------
               VERIFY WITH PAYSTACK
            ------------------------- */

            const paystackResponse =
                await fetch(
                    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
                    {
                        method: "GET",

                        headers: {

                            "Authorization":
                                `Bearer ${secretKey}`

                        }

                    }
                );


            const result =
                await paystackResponse.json();


            /* -------------------------
               PAYSTACK API ERROR
            ------------------------- */

            if (
                !paystackResponse.ok ||
                !result.status ||
                !result.data
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            result.message ||
                            "Payment verification failed"
                    },
                    400
                );

            }


            const transaction =
                result.data;


            /* -------------------------
               TRANSACTION STATUS
            ------------------------- */

            const paymentSuccessful =
                transaction.status ===
                "success";


            /* -------------------------
               RETURN RESULT
            ------------------------- */

            return jsonResponse({

                success: true,

                paid:
                    paymentSuccessful,

                status:
                    transaction.status,

                reference:
                    transaction.reference,

                amount:
                    transaction.amount,

                currency:
                    transaction.currency,

                paidAt:
                    transaction.paid_at || null,

                channel:
                    transaction.channel || null,

                customer:
                    transaction.customer
                        ? {
                            email:
                                transaction.customer.email
                        }
                        : null

            });

        }

        catch (error) {

            console.error(
                "Verify function error:",
                error
            );


            return jsonResponse(
                {
                    success: false,
                    message:
                        "Payment verification failed"
                },
                500
            );

        }

    }

};