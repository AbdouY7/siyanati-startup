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
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.sub },
      include: {
        store_profile: { select: { is_frozen: true } },
        professional_profile: { select: { is_frozen: true } }
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid or inactive token" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };

    const isFrozen = user.store_profile?.is_frozen || user.professional_profile?.is_frozen;

    if (isFrozen) {
      const whitelist = [
        { method: 'GET', path: '/api/subscription-plans' },
        { method: 'POST', path: '/api/subscriptions' },
        { method: 'POST', path: '/api/payments/subscription' },
        { method: 'GET', path: '/api/subscriptions/my' }
      ];

      const isWhitelisted = whitelist.some(route => 
        req.method === route.method && req.originalUrl.startsWith(route.path)
      );

      if (!isWhitelisted) {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_FROZEN',
          message: 'Your subscription has expired. Please renew to access your account.'
        });
      }
    }

    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

module.exports = authMiddleware;
