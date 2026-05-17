const sendEmail = async (to, subject, html) => {
  // Mock email service matching project style
  console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL BODY]:\n${html}\n`);
  return true;
};

module.exports = {
  sendEmail,
};
