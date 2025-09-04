/**
 * SMS Service Utility
 * This is a placeholder implementation that logs SMS to console
 * In production, integrate with Twilio, AWS SNS, or other SMS providers
 */

class SMSService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.smsProvider = process.env.SMS_PROVIDER || 'console';
  }

  /**
   * Send SMS with OTP
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code to send
   * @param {string} message - Custom message (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async sendOTP(phoneNumber, otp, message = null) {
    try {
      const defaultMessage = `Your Cafe Tamarind verification code is: ${otp}. Valid for 5 minutes.`;
      const smsMessage = message || defaultMessage;

      if (this.isProduction) {
        // In production, use actual SMS provider
        return await this.sendViaProvider(phoneNumber, smsMessage);
      } else {
        // In development, log to console
        return await this.sendViaConsole(phoneNumber, otp, smsMessage);
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  /**
   * Send SMS via console (development mode)
   */
  async sendViaConsole(phoneNumber, otp, message) {
    console.log('\n' + '='.repeat(50));
    console.log('📱 SMS SENT (Development Mode)');
    console.log('='.repeat(50));
    console.log(`📞 To: ${phoneNumber}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`💬 Message: ${message}`);
    console.log('='.repeat(50) + '\n');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Send SMS via actual provider (production mode)
   */
  async sendViaProvider(phoneNumber, message) {
    switch (this.smsProvider) {
      case 'msg91':
        return await this.sendViaMSG91(phoneNumber, message);
      case 'twilio':
        return await this.sendViaTwilio(phoneNumber, message);
      case 'aws-sns':
        return await this.sendViaAWSSNS(phoneNumber, message);
      default:
        console.warn(`SMS provider '${this.smsProvider}' not configured. Logging to console.`);
        return await this.sendViaConsole(phoneNumber, 'OTP', message);
    }
  }

  /**
   * Send via Twilio
   */
  async sendViaTwilio(phoneNumber, message) {
    try {
      // Check if Twilio credentials are configured
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.error('❌ Twilio credentials not configured. Please set:');
        console.error('   TWILIO_ACCOUNT_SID');
        console.error('   TWILIO_AUTH_TOKEN');
        console.error('   TWILIO_PHONE_NUMBER');
        return false;
      }

      // TODO: Uncomment and install twilio package for production
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // 
      // const result = await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });
      // 
      // console.log(`✅ Twilio SMS sent successfully. SID: ${result.sid}`);
      // return true;

      // For now, log the would-be SMS
      console.log(`📱 Twilio SMS would be sent:`);
      console.log(`   From: ${process.env.TWILIO_PHONE_NUMBER}`);
      console.log(`   To: ${phoneNumber}`);
      console.log(`   Message: ${message}`);
      console.log(`   (Install twilio package and uncomment code for real SMS)`);
      
      return true;
    } catch (error) {
      console.error('❌ Twilio SMS error:', error);
      return false;
    }
  }

  /**
   * Send via MSG91 (Indian SMS Provider)
   */
  async sendViaMSG91(phoneNumber, message) {
    try {
      // Check if MSG91 credentials are configured
      if (!process.env.MSG91_API_KEY || !process.env.MSG91_SENDER_ID) {
        console.error('❌ MSG91 credentials not configured. Please set:');
        console.error('   MSG91_API_KEY');
        console.error('   MSG91_SENDER_ID');
        return false;
      }

      // TODO: Uncomment and install msg91 package for production
      // const msg91 = require('msg91')(process.env.MSG91_API_KEY, process.env.MSG91_SENDER_ID, '4');
      // 
      // const result = await msg91.send(phoneNumber, message);
      // console.log(`✅ MSG91 SMS sent successfully. ID: ${result}`);
      // return true;

      // For now, log the would-be SMS
      console.log(`📱 MSG91 SMS would be sent:`);
      console.log(`   From: ${process.env.MSG91_SENDER_ID || 'CAFETM'}`);
      console.log(`   To: ${phoneNumber}`);
      console.log(`   Message: ${message}`);
      console.log(`   (Install msg91 package and uncomment code for real SMS)`);
      
      return true;
    } catch (error) {
      console.error('❌ MSG91 SMS error:', error);
      return false;
    }
  }

  /**
   * Send via AWS SNS (placeholder)
   */
  async sendViaAWSSNS(phoneNumber, message) {
    try {
      // Check if AWS credentials are configured
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
        console.error('❌ AWS credentials not configured. Please set:');
        console.error('   AWS_ACCESS_KEY_ID');
        console.error('   AWS_SECRET_ACCESS_KEY');
        console.error('   AWS_REGION');
        return false;
      }

      // TODO: Uncomment and install aws-sdk package for production
      // const AWS = require('aws-sdk');
      // const sns = new AWS.SNS({
      //   region: process.env.AWS_REGION,
      //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      // });
      // 
      // const result = await sns.publish({
      //   Message: message,
      //   PhoneNumber: phoneNumber
      // }).promise();
      // 
      // console.log(`✅ AWS SNS SMS sent successfully. MessageId: ${result.MessageId}`);
      // return true;

      // For now, log the would-be SMS
      console.log(`📱 AWS SNS SMS would be sent:`);
      console.log(`   To: ${phoneNumber}`);
      console.log(`   Message: ${message}`);
      console.log(`   (Install aws-sdk package and uncomment code for real SMS)`);
      
      return true;
    } catch (error) {
      console.error('❌ AWS SNS SMS error:', error);
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    // Basic validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phoneNumber);
  }
}

module.exports = new SMSService();
