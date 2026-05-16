const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const uploadImage = require("../utils/uploadImage");
const {
  professionalRegisterSchema,
  adminRegisterSchema,
} = require("../validators/auth.validator");

// ── Token helpers ─────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

const getFiles = (req, fieldName) => {
  if (!req.files) return [];
  if (Array.isArray(req.files)) {
    return req.files.filter((file) => file.fieldname === fieldName);
  }

  return req.files[fieldName] || [];
};

const uploadFiles = async (files, folder) => {
  const results = await Promise.all(
    files.map((file) => uploadImage(file.buffer, folder)),
  );

  return results.map((result) => result.secure_url);
};

// ── Controllers ───────────────────────────────────────────────────────────────

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    // const safeUser = { ...user, password_hash: undefined, refresh_token: undefined };

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

// register admin controller

// const registerAdmin = async (req, res, next) => {
//   const result = adminRegisterSchema.safeParse(req.body);
//   if (!result.success) {
//     return res.status(400).json({
//       message: "Validation error",
//       errors: result.error.flatten().fieldErrors,
//     });
//   }

//   const { email, password, phone } = result.data;

//   try {
//     const existingEmail = await prisma.user.findUnique({ where: { email } });
//     if (existingEmail) {
//       return res.status(409).json({ message: "Email already in use" });
//     }

//     const existingPhone = await prisma.user.findUnique({ where: { phone } });
//     if (existingPhone) {
//       return res.status(409).json({ message: "Phone number already in use" });
//     }

//     const password_hash = await bcrypt.hash(password, 12);

//     await prisma.user.create({
//       data: {
//         email,
//         phone,
//         password_hash,
//         role: "admin",
//         is_active: true,
//         email_verified: true, // admins are trusted, skip verification
//       },
//     });

//     return res.status(201).json({ message: "Admin registered successfully" });
//   } catch (err) {
//     next(err);
//   }
// };

const registerCustomer = async (req, res, next) => {
  const { email, password, phone, full_name, wilaya, address, date_of_birth } =
    req.body;

  if (!email || !password || !phone || !full_name) {
    return res
      .status(400)
      .json({ message: "Email, password, phone and full_name are required" });
  }

  if (date_of_birth) {
    const parsedDate = new Date(date_of_birth);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date_of_birth" });
    }
  }

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId = randomUUID();

    await prisma.user.create({
      data: {
        id: userId,
        email,
        password_hash,
        role: "customer",
        phone,
        client_profile: {
          create: {
            full_name,
            wilaya,
            address,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Customer registration successful, please login" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

const registerStore = async (req, res, next) => {
  const {
    email,
    password,
    phone,
    owner_name,
    store_name,
    description,
    address,
    wilaya,
    location_coordinates,
    documents,
    images,
    logo_url,
  } = req.body;

  if (
    !email ||
    !password ||
    !owner_name ||
    !phone ||
    !store_name ||
    !address ||
    !wilaya
  ) {
    return res.status(400).json({
      message:
        "email, password, phone, owner_name, store_name, address, and wilaya are required",
    });
  }

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const storeImageUrls = await uploadFiles(getFiles(req, "images"), "stores");
    const logoFiles = [
      ...getFiles(req, "logo"),
      ...getFiles(req, "image"),
      ...getFiles(req, "logo_url"),
    ];
    const [uploadedLogoUrl] = await uploadFiles(logoFiles.slice(0, 1), "stores");

    await prisma.$transaction([
      prisma.user.create({
        data: { id: userId, email, phone, password_hash, role: "store" },
      }),
      prisma.storeProfile.create({
        data: {
          user_id: userId,
          owner_name,
          store_name,
          description,
          address,
          wilaya,
          location_coordinates,
          documents: documents || [],
          images: storeImageUrls.length ? storeImageUrls : images || [],
          logo_url: uploadedLogoUrl || logo_url,
          status: "pending",
          submitted_at: new Date(),
        },
      }),
    ]);

    return res.status(201).json({
      message:
        "Store registration submitted successfully, pending admin approval",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

const registerProfessional = async (req, res, next) => {
  const result = professionalRegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const {
    email,
    password,
    phone,
    full_name,
    specialty_type,
    experience_years,
    wilaya,
    location_address,
    shop_images,
    documents,
    bio,
    hourly_rate_dzd,
  } = result.data;

  if (
    !email ||
    !password ||
    !full_name ||
    !phone ||
    !location_address ||
    !wilaya
  ) {
    return res.status(400).json({
      message:
        "email, password, phone, full_name, location_address, and wilaya are required",
    });
  }

  try {
    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Check phone uniqueness (phone exists on User model)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const shopImageFiles = [
      ...getFiles(req, "shop_images"),
      ...getFiles(req, "images"),
    ];
    const shopImageUrls = await uploadFiles(shopImageFiles, "professionals");

    await prisma.user.create({
      data: {
        id: userId,
        email,
        phone,
        password_hash,
        role: "professional",
        professional_profile: {
          create: {
            full_name,
            specialty_type,
            experience_years,
            wilaya,
            location_address,
            shop_images: shopImageUrls.length ? shopImageUrls : shop_images ?? [],
            documents: documents ?? [],
            bio,
            hourly_rate_dzd,
          },
        },
      },
    });

    return res.status(201).json({
      message:
        "Professional registration submitted successfully, pending admin approval",
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Verify the refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check it matches what's stored in DB
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotate refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: newRefreshToken },
    });

    return res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Clear refresh token from DB
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { refresh_token: null },
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// const getProfile = async (req, res, next) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//       include: {
//         client_profile: true,
//         store_profile: true,
//         professional_profile: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const safeUser = {
//       ...user,
//       password_hash: undefined,
//       refresh_token: undefined,
//     };
//     res.json(safeUser);
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  login,
  register: registerCustomer,
  registerCustomer,
  registerStore,
  registerProfessional,
  refreshToken,
  logout,
};
