const crypto = require("crypto");

/**
 * Generates a random 6-digit numeric OTP.
 * @returns {string} The 6-digit OTP as a string.
 */
const generateNumericOTP = () => {
  // Generates a random integer between 100000 and 999999
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

/**
 * Hashes an OTP for secure storage.
 * @param {string} otp The OTP to hash.
 * @returns {string} The hashed OTP.
 */
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = {
  generateNumericOTP,
  hashOTP,
};
