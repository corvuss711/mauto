import { RequestHandler } from "express";
import * as PaytmChecksum from "paytmchecksum";

// Paytm Configuration - These should be added to your .env file
const PAYTM_CONFIG = {
    MID: process.env.PAYTM_MID || "YOUR_MERCHANT_ID", // Get from Paytm Dashboard
    WEBSITE: process.env.PAYTM_WEBSITE || "WEBSTAGING", // WEBSTAGING for testing, WEBPROD for production
    CHANNEL_ID: process.env.PAYTM_CHANNEL_ID || "WEB",
    INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID || "Retail",
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL || "http://localhost:8080/api/paytm/callback",
    MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY || "YOUR_MERCHANT_KEY", // Get from Paytm Dashboard
    TXN_URL: process.env.PAYTM_TXN_URL || "https://securegw-stage.paytm.in/theia/processTransaction", // Staging URL
    STATUS_QUERY_URL: process.env.PAYTM_STATUS_QUERY_URL || "https://securegw-stage.paytm.in/order/status"
};

// Interface for payment initiation request
interface PaymentInitRequest {
    orderId: string;
    customerId: string;
    amount: string;
    mobile: string;
    email: string;
    planId?: number;
    pricingId?: number;
    numberOfUsers?: number;
    formData?: any;
    isCustomPlan?: boolean;
}

// Interface for payment callback
interface PaymentCallback {
    ORDERID: string;
    TXNID: string;
    TXNAMOUNT: string;
    STATUS: string;
    RESPCODE: string;
    RESPMSG: string;
    CHECKSUMHASH: string;
    [key: string]: any;
}

/**
 * Initialize Paytm Payment using Official Initiate Transaction API
 * This endpoint calls Paytm's initiate transaction API first, then returns payment data
 */
export const initializePayment: RequestHandler = async (req, res) => {
    try {
        const {
            orderId,
            customerId,
            amount,
            mobile,
            email,
            planId,
            pricingId,
            numberOfUsers,
            formData,
            isCustomPlan
        }: PaymentInitRequest = req.body;

        // Validate required fields
        if (!orderId || !customerId || !amount || !mobile || !email) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                message: "orderId, customerId, amount, mobile, and email are required"
            });
        }

        // For demo, we'll use ₹1.00 as amount
        const finalAmount = "1.00";

        console.log('🔄 [Paytm] Starting transaction initiation for order:', orderId);

        // Step 1: Call Paytm's Initiate Transaction API
        const initiateTransactionBody = {
            body: {
                requestType: "Payment",
                mid: PAYTM_CONFIG.MID,
                websiteName: PAYTM_CONFIG.WEBSITE,
                orderId: orderId,
                callbackUrl: PAYTM_CONFIG.CALLBACK_URL,
                txnAmount: {
                    value: finalAmount,
                    currency: "INR"
                },
                userInfo: {
                    custId: customerId,
                    email: email,
                    mobile: mobile
                }
            }
        };

        // Generate checksum for initiate transaction
        const checksum = await PaytmChecksum.generateSignature(
            JSON.stringify(initiateTransactionBody.body),
            PAYTM_CONFIG.MERCHANT_KEY
        );

        (initiateTransactionBody.body as any).signature = checksum;

        console.log('� [Paytm] Calling Initiate Transaction API...');

        // Call Paytm's Initiate Transaction API
        const fetch = (await import('node-fetch')).default;
        const initiateResponse = await fetch(
            `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${PAYTM_CONFIG.MID}&orderId=${orderId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initiateTransactionBody)
            }
        );

        const initiateData = await initiateResponse.json() as any;

        console.log('📊 [Paytm] Initiate Transaction Response:', {
            status: initiateResponse.status,
            resultCode: initiateData.body?.resultInfo?.resultCode,
            resultMsg: initiateData.body?.resultInfo?.resultMsg
        });

        if (!initiateResponse.ok || initiateData.body?.resultInfo?.resultCode !== 'S0001') {
            throw new Error(
                initiateData.body?.resultInfo?.resultMsg ||
                'Failed to initiate transaction with Paytm'
            );
        }

        // Step 2: Prepare payment form parameters
        const txnToken = initiateData.body.txnToken;

        if (!txnToken) {
            throw new Error('No transaction token received from Paytm');
        }

        // Payment form parameters for frontend
        const paytmParams: { [key: string]: string } = {
            MID: PAYTM_CONFIG.MID,
            ORDER_ID: orderId,
            TXN_TOKEN: txnToken
        };

        const response = {
            success: true,
            data: {
                paytmParams,
                txnToken,
                txnUrl: PAYTM_CONFIG.TXN_URL,
                // Store additional data for processing after payment
                metadata: {
                    planId,
                    pricingId,
                    numberOfUsers,
                    isCustomPlan,
                    formData
                }
            },
            message: "Transaction initiated successfully"
        };

        console.log('✅ [Paytm] Transaction initiated successfully for order:', orderId);
        console.log('🎫 [Paytm] Transaction token generated:', txnToken.substring(0, 20) + '...');

        res.json(response);

    } catch (error) {
        console.error('❌ [Paytm] Transaction initiation failed:', error);

        res.status(500).json({
            success: false,
            error: "Transaction initiation failed",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};

/**
 * Handle Paytm Payment Callback
 * This endpoint receives the payment response from Paytm
 */
export const handlePaymentCallback: RequestHandler = async (req, res) => {
    try {
        const paytmResponse: PaymentCallback = req.body;

        console.log('🔔 [Paytm] Payment callback received:', {
            orderId: paytmResponse.ORDERID,
            txnId: paytmResponse.TXNID,
            status: paytmResponse.STATUS,
            amount: paytmResponse.TXNAMOUNT,
            respCode: paytmResponse.RESPCODE,
            respMsg: paytmResponse.RESPMSG
        });

        // Verify checksum
        const receivedChecksum = paytmResponse.CHECKSUMHASH;
        delete paytmResponse.CHECKSUMHASH;

        const isValidChecksum = PaytmChecksum.verifySignature(
            JSON.stringify(paytmResponse),
            PAYTM_CONFIG.MERCHANT_KEY,
            receivedChecksum
        );

        if (!isValidChecksum) {
            console.error('❌ [Paytm] Invalid checksum received');
            return res.status(400).json({
                success: false,
                error: "Invalid checksum",
                message: "Payment verification failed"
            });
        }

        // Check payment status
        const isPaymentSuccessful = paytmResponse.STATUS === "TXN_SUCCESS";

        if (isPaymentSuccessful) {
            console.log('✅ [Paytm] Payment successful for order:', paytmResponse.ORDERID);

            // Store transaction details (you can save to database here)
            const transactionData = {
                orderId: paytmResponse.ORDERID,
                txnId: paytmResponse.TXNID,
                amount: paytmResponse.TXNAMOUNT,
                status: paytmResponse.STATUS,
                respCode: paytmResponse.RESPCODE,
                respMsg: paytmResponse.RESPMSG,
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                data: transactionData,
                message: "Payment completed successfully"
            });
        } else {
            console.log('❌ [Paytm] Payment failed for order:', paytmResponse.ORDERID);

            res.json({
                success: false,
                error: "Payment failed",
                message: paytmResponse.RESPMSG || "Payment was not successful",
                data: {
                    orderId: paytmResponse.ORDERID,
                    status: paytmResponse.STATUS,
                    respCode: paytmResponse.RESPCODE,
                    respMsg: paytmResponse.RESPMSG
                }
            });
        }

    } catch (error) {
        console.error('❌ [Paytm] Callback processing failed:', error);

        res.status(500).json({
            success: false,
            error: "Callback processing failed",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};

/**
 * Verify Payment Status
 * This endpoint queries Paytm to verify payment status
 */
export const verifyPaymentStatus: RequestHandler = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: "Missing orderId",
                message: "Order ID is required"
            });
        }

        // Prepare status query parameters
        const statusParams = {
            MID: PAYTM_CONFIG.MID,
            ORDERID: orderId
        };

        // Generate checksum for status query
        const checksum = await PaytmChecksum.generateSignature(
            JSON.stringify(statusParams),
            PAYTM_CONFIG.MERCHANT_KEY
        );

        const requestBody = {
            body: {
                ...statusParams,
                CHECKSUMHASH: checksum
            }
        };

        console.log('🔍 [Paytm] Verifying payment status for order:', orderId);

        // Query payment status
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(PAYTM_CONFIG.STATUS_QUERY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const statusData = await response.json() as any;

        console.log('📊 [Paytm] Status query response:', {
            orderId,
            status: statusData.body?.STATUS,
            respCode: statusData.body?.RESPCODE
        });

        res.json({
            success: true,
            data: statusData.body,
            message: "Status retrieved successfully"
        });

    } catch (error) {
        console.error('❌ [Paytm] Status verification failed:', error);

        res.status(500).json({
            success: false,
            error: "Status verification failed",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
