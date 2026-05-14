const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  console.log("Auth Header:", authHeader);
  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided in Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid or inactive token" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

module.exports = authMiddleware;
