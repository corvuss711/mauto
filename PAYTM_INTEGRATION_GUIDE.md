# Paytm Payment Gateway Integration - Setup Guide

## Overview

This guide explains how to set up and test the Paytm Payment Gateway integration for the ₹1 demo payment in the website builder application.

## 🚀 What's Implemented

### Backend Integration
- **Transaction Initiation API** (`/api/paytm/initialize`) - Calls Paytm's initiate transaction API and generates transaction token
- **Payment Callback Handler** (`/api/paytm/callback`) - Receives and validates payment responses from Paytm
- **Payment Status Verification** (`/api/paytm/verify-status`) - Queries Paytm for transaction status
- **Comprehensive Logging** - Console logs for debugging payment flow

### Frontend Integration
- **PaytmPaymentModal Component** - Modal interface for payment processing
- **Payment Flow Integration** - Seamlessly integrated with existing demo request flow
- **Status Polling** - Automatically checks payment status after submission
- **Error Handling** - User-friendly error messages and retry options

### Security Features
- **Checksum Validation** - All transactions verified using Paytm's checksum mechanism
- **Order ID Generation** - Unique order IDs for each transaction
- **Environment-based Configuration** - Separate staging and production configs

## 🔧 Required Setup

### 1. Paytm Merchant Account Setup

You need to create a Paytm merchant account and get the following credentials:

1. **Go to Paytm Business Dashboard**
   - Visit: https://dashboard.paytm.com/
   - Sign up for a business account

2. **Get API Credentials**
   - Navigate to "API Keys" section
   - Note down these values:
     - `MID` (Merchant ID)
     - `Merchant Key`
     - `Website` (WEBSTAGING for testing, WEBPROD for production)

3. **Configure Webhook URL**
   - Set callback URL in Paytm dashboard
   - For local development: `https://your-ngrok-url.ngrok-free.app/api/paytm/callback` (requires ngrok)
   - For production: `https://yourdomain.com/api/paytm/callback`
   - **Note:** Localhost URLs won't work - Paytm needs publicly accessible HTTPS URLs

### 2. Environment Configuration

Create a `.env` file (or update existing) with Paytm configuration:

```bash
# Paytm Payment Gateway Configuration (STAGING)
PAYTM_MID=your_merchant_id_here
PAYTM_MERCHANT_KEY=your_merchant_key_here
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE_ID=Retail
# For local testing with ngrok (REQUIRED for callback testing)
PAYTM_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/paytm/callback
PAYTM_TXN_URL=https://securegw-stage.paytm.in/theia/processTransaction
PAYTM_STATUS_QUERY_URL=https://securegw-stage.paytm.in/order/status
```

**⚠️ Important for Local Testing:**
Since Paytm requires a publicly accessible HTTPS callback URL, you **must use ngrok** for local development. See the detailed [Ngrok Setup Guide](./NGROK_SETUP_GUIDE.md) for complete instructions.

### 3. Dependencies

The following packages are already installed:
- `paytm-blink-checkout-react` - Frontend React components
- `paytm-pg-node-sdk` - Backend Node.js SDK
- `paytmchecksum` - Checksum generation and verification

## 🧪 Testing the Integration

### 1. Start the Development Server

```bash
npm run dev:full  # Starts both frontend and backend
```

### 2. Test Payment Flow

1. **Navigate to Demo Request Form**
   - Go to the website builder
   - Fill in the required information
   - Select a plan or create a custom plan
   - Click "Start Demo (₹1)" button

2. **Payment Modal Opens**
   - Modal shows payment details (₹1.00 amount)
   - Order ID is auto-generated
   - Customer ID uses email or generates guest ID

3. **Paytm Payment Process**
   - Click "Pay ₹1" button
   - New tab/window opens with Paytm payment page
   - Complete payment using test credentials (see below)

4. **Status Verification**
   - Application polls payment status automatically
   - Success: Proceeds with demo request API calls
   - Failure: Shows error message with retry option

### 3. Test Credentials (Staging)

For testing in staging environment, you can use these test credentials:

**Test Card Details:**
- Card Number: `4111111111111111`
- Expiry: Any future date
- CVV: `123`
- OTP: `489871`

**Test Net Banking:**
- Select any bank from test list
- Use credentials provided by Paytm for specific banks

**Test Wallet:**
- Mobile: `7777777777`
- OTP: `489871`

## 🔍 Debugging and Logs

### Console Logs to Monitor

**Frontend (Browser Console):**
```javascript
🚀 [Paytm] Initiating payment with data: {...}
✅ [Paytm] Payment initialized: {...}
📝 [Paytm] Payment form submitted to: https://...
🔍 [Paytm] Polling payment status (attempt 1/30)
✅ [Paytm] Payment successful!
```

**Backend (Server Console):**
```javascript
🔄 [Paytm] Initiating payment with params: {...}
✅ [Paytm] Payment initialized successfully for order: DEMO_...
🔔 [Paytm] Payment callback received: {...}
✅ [Paytm] Payment successful for order: DEMO_...
📊 [Paytm] Status query response: {...}
```

### API Endpoints for Testing

You can test the APIs directly using curl:

**1. Initialize Payment:**
```bash
curl -X POST http://localhost:8080/api/paytm/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST_ORDER_123",
    "customerId": "test@example.com",
    "amount": "1.00",
    "mobile": "9999999999",
    "email": "test@example.com"
  }'
```

**2. Verify Payment Status:**
```bash
curl -X POST http://localhost:8080/api/paytm/verify-status \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST_ORDER_123"
  }'
```

## 🚨 Common Issues and Solutions

### 1. "Invalid checksum" Error
- **Cause:** Wrong merchant key or parameters mismatch
- **Solution:** Verify PAYTM_MERCHANT_KEY in .env file

### 2. "Payment initialization failed" Error
- **Cause:** Missing required fields or network issues
- **Solution:** Check all required fields (orderId, customerId, amount, mobile, email)

### 3. Payment Status Not Updating
- **Cause:** Callback URL not reachable or polling issues
- **Solution:** Ensure callback URL is accessible from internet (use ngrok for local testing)

### 4. "Merchant not found" Error
- **Cause:** Wrong MID or not configured properly
- **Solution:** Verify PAYTM_MID matches your dashboard MID

## 🌐 Production Deployment

### Environment Variables for Production:

```bash
PAYTM_MID=your_production_mid
PAYTM_MERCHANT_KEY=your_production_key
PAYTM_WEBSITE=DEFAULT
PAYTM_CALLBACK_URL=https://yourdomain.com/api/paytm/callback
PAYTM_TXN_URL=https://securegw.paytm.in/theia/processTransaction
PAYTM_STATUS_QUERY_URL=https://securegw.paytm.in/order/status
```

### SSL Certificate Required
- Paytm requires HTTPS for production callbacks
- Ensure your domain has valid SSL certificate

### Webhook Configuration
- Configure production callback URL in Paytm dashboard
- Test webhook delivery using Paytm's webhook testing tool

## 📋 Integration Checklist

- [ ] Paytm merchant account created
- [ ] API credentials obtained (MID, Merchant Key)
- [ ] Environment variables configured
- [ ] Test payment successful in staging
- [ ] Callback URL accessible
- [ ] Console logs showing correct flow
- [ ] Error handling working
- [ ] Status polling functional
- [ ] Production credentials configured (when ready)

## 📞 Support Resources

- **Paytm Developer Documentation:** https://developer.paytm.com/docs/
- **Integration Guide:** https://www.paytmpayments.com/docs/api/initiate-transaction-api/
- **SDK Documentation:** https://www.paytmpayments.com/docs/all-in-one-sdk/
- **Support Email:** developer@paytm.com

## 🔐 Security Notes

- Never commit merchant keys to version control
- Use environment variables for all sensitive data
- Validate all webhook data with checksum verification
- Log transactions for audit purposes
- Implement rate limiting for payment APIs
