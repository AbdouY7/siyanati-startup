const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Sends an SMS message to a given phone number.
 * @param {string} to The recipient's phone number (in E.164 format, e.g., +213...).
 * @param {string} message The text message to send.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
const sendSMS = async (to, message) => {
  try {
    if (!client || !fromPhone) {
      console.log("\n==========================================");
      console.log(`[MOCK SMS SENT] To: ${to}`);
      console.log(`[MESSAGE]: ${message}`);
      console.log("==========================================\n");
      console.warn("⚠️ Twilio credentials not configured in .env. SMS was only logged.");
      // Simulate network delay for realistic mock behavior
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true; // Pretend it succeeded
    }

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to,
    });
    
    console.log(`[SMS SENT] To: ${to} | SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send SMS to ${to}:`, error);
    return false;
  }
};

module.exports = {
  sendSMS,
};
