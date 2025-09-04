# SMS Setup Guide

## Current Status: Development Mode Only

**Currently, NO actual SMS messages are being sent to customers.** The system is in development mode and only logs messages to the console.

## SMS Provider Options

### Option 1: Twilio (Recommended)

#### Step 1: Sign up for Twilio
1. Go to [Twilio.com](https://www.twilio.com)
2. Create a free account
3. Get your Account SID and Auth Token from the dashboard
4. Purchase a phone number (or use trial number)

#### Step 2: Install Twilio Package
```bash
cd backend
npm install twilio
```

#### Step 3: Configure Environment Variables
Add to your `backend/.env` file:
```env
# SMS Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

#### Step 4: Enable Real SMS
In `backend/utils/smsService.js`, uncomment the Twilio code:
```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const result = await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});

console.log(`✅ Twilio SMS sent successfully. SID: ${result.sid}`);
return true;
```

### Option 2: AWS SNS

#### Step 1: Set up AWS Account
1. Create AWS account
2. Set up IAM user with SNS permissions
3. Get Access Key ID and Secret Access Key

#### Step 2: Install AWS SDK
```bash
cd backend
npm install aws-sdk
```

#### Step 3: Configure Environment Variables
Add to your `backend/.env` file:
```env
# SMS Configuration
SMS_PROVIDER=aws-sns
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

### Option 3: Other SMS Providers

You can integrate with other providers like:
- **MessageBird**
- **Vonage (formerly Nexmo)**
- **Plivo**
- **Local SMS gateways**

## Phone Number Configuration

### From Number (Sender)
- **Twilio**: Use your purchased Twilio phone number
- **AWS SNS**: Use AWS SNS (no specific number needed)
- **Other providers**: Use provider's assigned number

### To Number (Recipient)
- Customer's phone number (e.g., +91-9544494311)
- Must include country code for international delivery

## Testing SMS

### Development Mode (Current)
```bash
# Check server console for simulated SMS
==================================================
📱 SMS SENT (Development Mode)
==================================================
📞 To: 9544494311
🔢 OTP: 5464
💬 Message: Your Cafe Tamarind verification code is: 5464. Valid for 5 minutes.
==================================================
```

### Production Mode (With Real SMS)
```bash
# Check server console for real SMS confirmation
✅ Twilio SMS sent successfully. SID: SM1234567890abcdef
```

## Cost Considerations

### Twilio Pricing (US)
- **Trial**: Free credits for testing
- **Production**: ~$0.0075 per SMS (US numbers)
- **International**: Varies by country

### AWS SNS Pricing
- **US**: ~$0.00645 per SMS
- **International**: Varies by country

## Security Best Practices

### 1. Environment Variables
- Never commit SMS credentials to version control
- Use `.env` files (already in `.gitignore`)
- Use different credentials for development/production

### 2. Rate Limiting
- Already implemented in the OTP service
- Prevents SMS spam and abuse

### 3. Phone Number Validation
- Validate phone numbers before sending
- Use proper country code format

## Troubleshooting

### Common Issues

1. **"Twilio credentials not configured"**
   - Check environment variables are set correctly
   - Restart server after changing `.env`

2. **"Invalid phone number"**
   - Ensure phone number includes country code
   - Format: +91-9544494311 (not 9544494311)

3. **"SMS not delivered"**
   - Check Twilio/AWS dashboard for delivery status
   - Verify phone number is valid
   - Check account balance/credits

4. **"Rate limit exceeded"**
   - Wait before requesting new OTP
   - Check SMS provider's rate limits

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   echo $TWILIO_PHONE_NUMBER
   ```

2. **Test SMS Provider**
   ```bash
   # Use provider's test tools
   twilio api:core:messages:create --to +1234567890 --from +0987654321 --body "Test message"
   ```

3. **Check Server Logs**
   ```bash
   # Look for SMS-related logs
   tail -f backend/logs/app.log
   ```

## Production Deployment

### 1. Set Production Environment
```env
NODE_ENV=production
SMS_PROVIDER=twilio
```

### 2. Configure Production Credentials
- Use production SMS provider account
- Set up proper phone numbers
- Configure webhook endpoints (if needed)

### 3. Monitor SMS Delivery
- Set up logging and monitoring
- Track delivery rates and failures
- Monitor costs and usage

## Quick Setup for Testing

### Minimal Twilio Setup
1. Sign up for Twilio (free trial)
2. Get Account SID and Auth Token
3. Use trial phone number
4. Add to `.env`:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=AC1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
5. Install and enable Twilio package
6. Test with a real phone number

## Support

For SMS provider-specific issues:
- **Twilio**: [Twilio Support](https://support.twilio.com)
- **AWS SNS**: [AWS Support](https://aws.amazon.com/support)
- **General**: Check provider documentation

The SMS service is ready for production once you configure a real SMS provider! 🚀
