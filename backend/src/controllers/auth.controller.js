const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const uploadImage = require("../utils/uploadImage");

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

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

// register admin controller

const registerAdmin = async (req, res, next) => {
  // const result = adminRegisterSchema.safeParse(req.body);
  // if (!result.success) {
  //   return res.status(400).json({
  //     message: "Validation error",
  //     errors: result.error.flatten().fieldErrors,
  //   });
  // }

  const { email, password, phone } = req.body;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        phone,
        password_hash,
        role: "admin",
        is_active: true,
        email_verified: true, // admins are trusted, skip verification
      },
    });

    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    next(err);
  }
};

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
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email or phone number already in use" });
    }
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
    const storeDocumentUrls = await uploadFiles(getFiles(req, "documents"), "store-documents");
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
          documents: storeDocumentUrls.length ? storeDocumentUrls : documents || [],
          images: storeImageUrls.length ? storeImageUrls : images || [],
          logo_url: uploadedLogoUrl || logo_url,
          status: "pending",
          submitted_at: new Date(),
        },
      }),
    ]);

    const { notifyAdmins } = require("../services/notification.service");
    await notifyAdmins("new_store_registration", "Nouveau Magasin", `Le magasin ${store_name} (${owner_name}) s'est inscrit et attend votre approbation.`);

    return res.status(201).json({
      message:
        "Store registration submitted successfully, pending admin approval",
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email or phone number already in use" });
    }
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

const registerProfessional = async (req, res, next) => {
  const {
    email,
    password,
    phone,
    full_name,
    specialty_type,
    experience_years,
    wilaya,
    location_address,
    work_phone,
    bio,
    hourly_rate_dzd,
    work_type,
    // Store fields (conditional — only when work_type === "avec_magasin")
    store_name,
    store_address,
    store_wilaya,
    store_location,
  } = req.body;

  if (
    !email ||
    !password ||
    !full_name ||
    !phone ||
    !wilaya
  ) {
    return res.status(400).json({
      message:
        "email, password, phone, full_name, and wilaya are required",
    });
  }

  const resolvedWorkType = work_type || "individuel";

  // Validate store fields when "avec_magasin"
  if (resolvedWorkType === "avec_magasin") {
    if (!store_name || !store_address || !store_wilaya) {
      return res.status(400).json({
        message:
          "store_name, store_address, and store_wilaya are required for 'avec_magasin' work type",
      });
    }
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

    // Upload professional documents
    const docFiles = getFiles(req, "documents");
    const docUrls = docFiles.length ? await uploadFiles(docFiles, "professionals") : [];

    // Create user + professional profile
    const professionalProfileId = randomUUID();

    const transactionOps = [
      prisma.user.create({
        data: {
          id: userId,
          email,
          phone,
          password_hash,
          role: "professional",
        },
      }),
      prisma.professionalProfile.create({
        data: {
          id: professionalProfileId,
          user_id: userId,
          full_name,
          specialty_type: specialty_type || "other",
          experience_years: experience_years ? Number(experience_years) : undefined,
          wilaya,
          location_address,
          documents: docUrls,
          bio,
          hourly_rate_dzd: hourly_rate_dzd ? Number(hourly_rate_dzd) : undefined,
          work_type: resolvedWorkType,
        },
      }),
    ];

    // If "avec_magasin", also create the ProfessionalStore
    if (resolvedWorkType === "avec_magasin") {
      const storeDocFiles = getFiles(req, "store_documents");
      const storeImageFiles = getFiles(req, "store_images");
      const storeDocUrls = storeDocFiles.length ? await uploadFiles(storeDocFiles, "professional-stores") : [];
      const storeImageUrls = storeImageFiles.length ? await uploadFiles(storeImageFiles, "professional-stores") : [];

      transactionOps.push(
        prisma.professionalStore.create({
          data: {
            professional_id: professionalProfileId,
            name: store_name,
            wilaya: store_wilaya,
            address: store_address,
            location_coordinates: store_location || undefined,
            documents: storeDocUrls,
            images: storeImageUrls,
            status: "pending",
          },
        }),
      );
    }

    await prisma.$transaction(transactionOps);

    const { notifyAdmins } = require("../services/notification.service");
    await notifyAdmins("new_professional_registration", "Nouveau Professionnel", `Le professionnel ${full_name} s'est inscrit et attend votre approbation.`);

    return res.status(201).json({
      message:
        "Professional registration submitted successfully, pending admin approval",
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email or phone number already in use" });
    }
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
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
    const { refreshToken } = req.body || {};
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

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const sendEmailVerification = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verification_token: hashedToken,
        email_verification_expires_at: expiresAt,
      },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Please click the button below to verify your email address. This link will expire in 24 hours.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
    `;

    await sendEmail(user.email, "Verify your email", html);

    return res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        email_verification_token: hashedToken,
        email_verification_expires_at: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null,
      },
    });

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expires_at: expiresAt,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password. This link will expire in 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
    `;

    await sendEmail(user.email, "Password Reset", html);

    return res.json({ success: true, message: "If an account exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirm_password } = req.body;
    if (!token || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: "Token, password, and confirm_password are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires_at: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const newPasswordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: newPasswordHash,
        reset_password_token: null,
        reset_password_expires_at: null,
        refresh_token: null,
      },
    });

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

const sendPhoneVerification = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.phone) {
      return res.status(400).json({ success: false, message: "No phone number associated with account" });
    }

    if (user.phone_verified) {
      return res.status(400).json({ success: false, message: "Phone already verified" });
    }

    const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = hashToken(rawOTP);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone_verification_code: hashedOTP,
        phone_verification_expires_at: expiresAt,
      },
    });

    await sendSMS(user.phone, `Your verification code is: ${rawOTP}. Valid for 5 minutes.`);

    return res.json({ success: true, message: "Verification SMS sent" });
  } catch (error) {
    next(error);
  }
};

const verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Code is required" });

    const hashedOTP = hashToken(code);

    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        phone_verification_code: hashedOTP,
        phone_verification_expires_at: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone_verified: true,
        phone_verification_code: null,
        phone_verification_expires_at: null,
      },
    });

    return res.json({ success: true, message: "Phone verified successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register: registerCustomer,
  registerCustomer,
  registerStore,
  registerProfessional,
  registerAdmin,
  refreshToken,
  logout,
  sendEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendPhoneVerification,
  verifyPhone,
};
