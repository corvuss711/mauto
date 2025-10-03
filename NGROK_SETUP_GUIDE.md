# 🌐 Ngrok Setup Guide for Paytm Local Testing

## Why Ngrok is Needed

Paytm Payment Gateway requires a **publicly accessible HTTPS callback URL** to send payment notifications. Since your local development server runs on `http://localhost:8080`, Paytm cannot reach it directly. Ngrok creates a secure tunnel to your localhost, making it accessible from the internet.

## 📦 Installation Steps

### 1. Install Ngrok

**Option A: Download from Website**
1. Go to https://ngrok.com/download
2. Create a free account
3. Download ngrok for macOS
4. Unzip and move to `/usr/local/bin/` or add to PATH

**Option B: Install via Homebrew (Recommended)**
```bash
brew install ngrok/ngrok/ngrok
```

### 2. Authenticate Ngrok
```bash
# Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## 🚀 Setup Process

### Step 1: Start Your Development Server
```bash
# In your project directory
npm run dev:server
# Server should be running on http://localhost:8080
```

### Step 2: Start Ngrok Tunnel (New Terminal)
```bash
# Create tunnel to port 8080
ngrok http 8080
```

You'll see output like this:
```
ngrok                                                          

Session Status                online                          
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x                           
Region                        United States (us)             
Latency                       -                              
Web Interface                 http://127.0.0.1:4040          
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90     
                              0       0       0.00    0.00    0.00    0.00    
```

### Step 3: Copy Your Ngrok URL
From the output above, copy the HTTPS URL: `https://abc123.ngrok-free.app`

### Step 4: Update Your .env File
```bash
# Update your .env file with the ngrok URL
PAYTM_CALLBACK_URL=https://abc123.ngrok-free.app/api/paytm/callback
```

### Step 5: Restart Your Server
```bash
# Restart to pick up the new environment variable
npm run dev:server
```

## 🧪 Testing the Setup

### 1. Test Callback URL Accessibility
Open your browser and visit:
```
https://your-ngrok-url.ngrok-free.app/api/ping
```
You should see: `{"message":"Hello from Express server v2!"}`

### 2. Test Paytm Integration
```bash
# Run the Paytm test script
node test-paytm.cjs
```

### 3. Test Complete Payment Flow
1. Go to your application: `https://your-ngrok-url.ngrok-free.app`
2. Navigate to demo request form
3. Click "Start Demo (₹1)"
4. Complete test payment
5. Check server console for callback logs

## 📝 Environment Configuration Examples

### For Local Development (.env)
```bash
# Your actual ngrok URL (changes each restart unless using reserved domain)
PAYTM_CALLBACK_URL=https://abc123.ngrok-free.app/api/paytm/callback

# Other Paytm settings
PAYTM_MID=your_actual_merchant_id
PAYTM_MERCHANT_KEY=your_actual_merchant_key
PAYTM_WEBSITE=WEBSTAGING
```

### For Production (.env.production)
```bash
# Your actual production domain
PAYTM_CALLBACK_URL=https://yourdomain.com/api/paytm/callback
PAYTM_WEBSITE=DEFAULT
```

## 🔧 Ngrok Advanced Configuration

### Reserved Domain (Paid Feature)
If you upgrade to a paid ngrok plan, you can use a reserved domain:
```bash
ngrok http 8080 --domain=your-reserved-domain.ngrok-free.app
```

### Custom Configuration File
Create `ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN
tunnels:
  paytm-dev:
    addr: 8080
    proto: http
    schemes: [https]
    inspect: true
```

Then run:
```bash
ngrok start paytm-dev
```

## 🚨 Important Notes

### ⚠️ Ngrok URL Changes
- Free ngrok URLs change every time you restart
- Update your `.env` file each time you get a new URL
- Consider upgrading to a paid plan for stable URLs

### ⚠️ Security Considerations
- Never commit ngrok URLs to version control
- Use environment variables for all URLs
- Ngrok tunnels are temporary - not for production

### ⚠️ Free Plan Limitations
- URL changes on restart
- Limited concurrent connections
- Basic inspect interface

## 🔍 Debugging with Ngrok

### 1. Web Interface
Visit `http://127.0.0.1:4040` to see:
- Live request/response logs
- Request details and timing
- Response inspection

### 2. Console Logs
Monitor both:
- **Your server console** for application logs
- **Ngrok console** for tunnel status

### 3. Paytm Callback Logs
Look for these in your server console:
```javascript
🔔 [Paytm] Payment callback received: {...}
✅ [Paytm] Payment successful for order: DEMO_...
❌ [Paytm] Invalid checksum received
```

## 📋 Complete Testing Checklist

- [ ] Ngrok installed and authenticated
- [ ] Ngrok tunnel running on port 8080
- [ ] .env file updated with ngrok URL
- [ ] Server restarted with new environment
- [ ] Callback URL accessible via browser
- [ ] Test script passes
- [ ] Payment flow works end-to-end
- [ ] Callback logs appear in console

## 🆘 Troubleshooting

### "Callback URL not reachable"
- Check if ngrok tunnel is running
- Verify the URL is correct in .env
- Ensure server is running on port 8080

### "Invalid tunnel" error
- Re-authenticate: `ngrok config add-authtoken YOUR_TOKEN`
- Check account limits on ngrok dashboard

### "Connection refused" 
- Make sure your local server is running first
- Check if port 8080 is available

### Callback not received
- Check ngrok web interface for incoming requests
- Verify callback URL in Paytm dashboard matches ngrok URL
- Look for firewall blocking ngrok

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start your server
npm run dev:server

# Terminal 2: Start ngrok
ngrok http 8080

# Terminal 3: Update .env and test
echo "PAYTM_CALLBACK_URL=https://your-new-url.ngrok-free.app/api/paytm/callback" >> .env
node test-paytm.cjs
```

This setup allows you to test the complete Paytm payment flow locally with real callback handling!
