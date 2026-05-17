const sendSMS = async (phone, message) => {
  // Mock SMS service matching project style
  console.log(`[SMS SENT] To: ${phone} | Message: ${message}`);
  return true;
};

module.exports = {
  sendSMS,
};
