# SMS Setup Guide for India

## Current Status: Development Mode Only

**Currently, NO actual SMS messages are being sent to customers.** The system is in development mode and only logs messages to the console.

## SMS Provider Options for India

### Option 1: MSG91 (Recommended for India)

#### Step 1: Sign up for MSG91
1. Go to [MSG91.com](https://msg91.com)
2. Create an account
3. Get your API key and sender ID
4. Verify your business for promotional SMS

#### Step 2: Install MSG91 Package
```bash
cd backend
npm install msg91
```

#### Step 3: Configure Environment Variables
Add to your `backend/.env` file:
```env
# SMS Configuration for India
SMS_PROVIDER=msg91
MSG91_API_KEY=your_api_key_here
MSG91_SENDER_ID=CAFETM
MSG91_TEMPLATE_ID=your_template_id
```

#### Step 4: Enable Real SMS
In `backend/utils/smsService.js`, add MSG91 integration:
```javascript
async sendViaMSG91(phoneNumber, message) {
  try {
    const msg91 = require('msg91')(process.env.MSG91_API_KEY, 'CAFETM', '4');
    
    const result = await msg91.send(phoneNumber, message);
    console.log(`✅ MSG91 SMS sent successfully. ID: ${result}`);
    return true;
  } catch (error) {
    console.error('❌ MSG91 SMS error:', error);
    return false;
  }
}
```

### Option 2: Twilio (International Provider)

#### Step 1: Sign up for Twilio
1. Go to [Twilio.com](https://www.twilio.com)
2. Create account and get Indian phone number
3. Get Account SID and Auth Token

#### Step 2: Install Twilio Package
```bash
cd backend
npm install twilio
```

#### Step 3: Configure Environment Variables
```env
# SMS Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
```

### Option 3: AWS SNS (International Provider)

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
```env
# SMS Configuration
SMS_PROVIDER=aws-sns
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
```

### Option 4: Indian SMS Gateways

#### Popular Indian SMS Providers:
- **MSG91** - Most popular for Indian businesses
- **TextLocal** - Good for bulk SMS
- **Way2SMS** - Affordable option
- **SMS Gateway India** - Local provider
- **KAPSYSTEM** - Enterprise solution

## Indian Phone Number Format

### Correct Format for India:
```
+91-9544494311    ✅ Correct
+919544494311     ✅ Correct
919544494311      ✅ Correct
9544494311        ❌ Missing country code
```

### Phone Number Validation for India:
```javascript
// Indian phone number regex
const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
```

## Cost Comparison for India

### MSG91 Pricing (Recommended)
- **Transactional SMS**: ₹0.12 per SMS
- **Promotional SMS**: ₹0.15 per SMS
- **Bulk SMS**: ₹0.10 per SMS (1000+ messages)
- **Free Credits**: Available for new accounts

### Twilio Pricing (India)
- **Indian Numbers**: $0.0075 per SMS (~₹0.62)
- **International**: Varies by country
- **Free Trial**: Available

### AWS SNS Pricing (India)
- **Indian Numbers**: $0.00645 per SMS (~₹0.53)
- **International**: Varies by country

## TRAI Compliance for India

### DLT (Distributed Ledger Technology) Registration
1. **Register with TRAI**: Required for promotional SMS
2. **Get Sender ID**: 6-character alphanumeric ID
3. **Template Approval**: Pre-approved message templates
4. **Consent Management**: Track user consent

### Required for Indian SMS:
- **Sender ID**: CAFETM (example)
- **Template ID**: Pre-approved message format
- **Consent**: User must opt-in
- **Unsubscribe**: Easy opt-out mechanism

## Quick Setup for India

### MSG91 Setup (Recommended)
1. **Sign up**: [MSG91.com](https://msg91.com)
2. **Get API Key**: From dashboard
3. **Set Sender ID**: CAFETM (or your business name)
4. **Create Template**: "Your Cafe Tamarind verification code is {{#var#}}. Valid for 5 minutes."
5. **Add to .env**:
   ```env
   SMS_PROVIDER=msg91
   MSG91_API_KEY=your_api_key
   MSG91_SENDER_ID=CAFETM
   MSG91_TEMPLATE_ID=your_template_id
   ```

### Test with Indian Number
```javascript
// Test phone number format
const testPhone = '+91-9544494311';
const message = 'Your Cafe Tamarind verification code is 1234. Valid for 5 minutes.';
```

## Indian SMS Best Practices

### 1. Message Format
```
Sender ID: CAFETM
Message: Your Cafe Tamarind verification code is 1234. Valid for 5 minutes.
```

### 2. Timing
- **Transactional SMS**: 24/7 allowed
- **Promotional SMS**: 9 AM to 9 PM only
- **Avoid**: Festival days and holidays

### 3. Content Guidelines
- **No promotional content** in transactional SMS
- **Clear sender identification**
- **Easy unsubscribe option**
- **Respect DND (Do Not Disturb) registry**

## Troubleshooting for India

### Common Issues:

1. **"Invalid phone number"**
   - Ensure country code (+91) is included
   - Check number starts with 6, 7, 8, or 9
   - Format: +91-9544494311

2. **"DLT template not approved"**
   - Use pre-approved templates
   - Register with TRAI
   - Get template ID from provider

3. **"SMS not delivered"**
   - Check DND status
   - Verify sender ID is approved
   - Check account balance

4. **"Rate limit exceeded"**
   - Respect TRAI guidelines
   - Use proper timing for promotional SMS
   - Check provider's rate limits

### Debug Steps:

1. **Check Phone Number Format**
   ```bash
   # Should be: +91-9544494311
   echo $CUSTOMER_PHONE
   ```

2. **Verify Provider Credentials**
   ```bash
   # For MSG91
   echo $MSG91_API_KEY
   echo $MSG91_SENDER_ID
   ```

3. **Test with Provider Dashboard**
   - Use provider's test tools
   - Check delivery reports
   - Monitor account balance

## Production Deployment for India

### 1. TRAI Compliance
- Register business with TRAI
- Get DLT approval
- Set up consent management
- Create approved templates

### 2. Provider Setup
- Choose reliable Indian provider (MSG91 recommended)
- Set up proper sender ID
- Configure webhook endpoints
- Set up monitoring and alerts

### 3. Testing
- Test with multiple Indian numbers
- Verify delivery across different carriers
- Check compliance with TRAI guidelines
- Monitor delivery rates

## Quick Start for Testing

### Minimal MSG91 Setup
1. Sign up for MSG91 (free credits available)
2. Get API key and sender ID
3. Create OTP template
4. Add to `.env`:
   ```env
   SMS_PROVIDER=msg91
   MSG91_API_KEY=your_api_key
   MSG91_SENDER_ID=CAFETM
   MSG91_TEMPLATE_ID=your_template_id
   ```
5. Test with Indian phone number: +91-9544494311

## Support for India

- **MSG91**: [MSG91 Support](https://msg91.com/support)
- **TRAI**: [TRAI Guidelines](https://trai.gov.in/sms-spam)
- **TextLocal**: [TextLocal Support](https://textlocal.in/support)

## Cost-Effective Solution for India

**Recommended Setup:**
- **Provider**: MSG91
- **Cost**: ₹0.12 per SMS (transactional)
- **Compliance**: TRAI DLT ready
- **Reliability**: High delivery rates in India
- **Support**: Local support team

The SMS service is ready for Indian customers once you configure MSG91 or another Indian SMS provider! 🇮🇳
