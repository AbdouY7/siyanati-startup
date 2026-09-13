const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const uploadImage = require("../utils/uploadImage");
const { generateNumericOTP, hashOTP } = require("../utils/otp.util");
const { sendSMS } = require("../services/sms.service");
const { sendEmail } = require("../utils/mail.utils");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Google token required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    if (!payload.email_verified) {
      return res.status(401).json({ message: "Google email not verified" });
    }

    // 1. Check if user exists by google_id
    let user = await prisma.user.findUnique({ where: { google_id: googleId } });

    if (!user) {
      // 2. Check if user exists by email
      user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // Link google_id to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { google_id: googleId },
        });
      } else {
        // 3. Create new user as customer
        const userId = randomUUID();
        user = await prisma.user.create({
          data: {
            id: userId,
            email,
            google_id: googleId,
            role: "customer",
            email_verified: true,
          },
        });

        // Create client profile for the new user
        await prisma.clientProfile.create({
          data: {
            user_id: userId,
            full_name: payload.name || "Google User",
            avatar_url: payload.picture,
          },
        });
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Google auth error:", error);
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

    const formattedPhone = phone;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: formattedPhone } });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        phone: formattedPhone,
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
  const { email, password, phone, full_name, wilaya, address, date_of_birth } = req.body;

  if (!email || !password || !phone || !full_name) {
    return res.status(400).json({ message: "Email, password, phone and full_name are required" });
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
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const existingPending = await prisma.pendingRegistration.findUnique({ where: { email } });

    const password_hash = await bcrypt.hash(password, 12);
    const otp = generateNumericOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const pendingData = {
      password_hash,
      phone,
      role: "customer",
      registration_data: { full_name, wilaya, address, date_of_birth },
      otp_hash: hashedOtp,
      otp_expires_at: expiresAt,
      otp_last_sent_at: new Date(),
    };

    let pendingRegistration;
    if (existingPending) {
      pendingRegistration = await prisma.pendingRegistration.update({
        where: { email },
        data: pendingData,
      });
    } else {
      pendingRegistration = await prisma.pendingRegistration.create({
        data: {
          email,
          ...pendingData
        },
      });
    }

    const pendingToken = jwt.sign({ pendingId: pendingRegistration.id, type: "pending" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2>Verify your email address</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;

    await sendEmail(email, "Your Email Verification Code", html);

    return res.status(200).json({ message: "Please verify your email", pendingToken });
  } catch (err) {
    next(err);
  }
};

const registerStore = async (req, res, next) => {
  const { email, password, phone, owner_name, store_name, description, address, wilaya, location_coordinates, documents, images, logo_url } = req.body;

  if (!email || !password || !owner_name || !phone || !store_name || !address || !wilaya) {
    return res.status(400).json({ message: "email, password, phone, owner_name, store_name, address, and wilaya are required" });
  }

  const formattedPhone = phone;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (formattedPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: formattedPhone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const existingPending = await prisma.pendingRegistration.findUnique({ where: { email } });

    const password_hash = await bcrypt.hash(password, 12);
    const storeDocumentUrls = await uploadFiles(getFiles(req, "documents"), "store-documents");
    const storeImageUrls = await uploadFiles(getFiles(req, "images"), "stores");
    const logoFiles = [...getFiles(req, "logo"), ...getFiles(req, "image"), ...getFiles(req, "logo_url")];
    const [uploadedLogoUrl] = await uploadFiles(logoFiles.slice(0, 1), "stores");

    const otp = generateNumericOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const pendingData = {
      password_hash,
      phone: formattedPhone,
      role: "store",
      registration_data: { owner_name, store_name, description, address, wilaya, location_coordinates },
      file_urls: {
        documents: storeDocumentUrls.length ? storeDocumentUrls : documents || [],
        images: storeImageUrls.length ? storeImageUrls : images || [],
        logo_url: uploadedLogoUrl || logo_url
      },
      otp_hash: hashedOtp,
      otp_expires_at: expiresAt,
      otp_last_sent_at: new Date(),
    };

    let pendingRegistration;
    if (existingPending) {
      pendingRegistration = await prisma.pendingRegistration.update({
        where: { email },
        data: pendingData,
      });
    } else {
      pendingRegistration = await prisma.pendingRegistration.create({
        data: {
          email,
          ...pendingData
        },
      });
    }

    const pendingToken = jwt.sign({ pendingId: pendingRegistration.id, type: "pending" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2>Verify your email address</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;

    await sendEmail(email, "Your Email Verification Code", html);

    return res.status(200).json({ message: "Please verify your email", pendingToken });
  } catch (err) {
    next(err);
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

  const formattedPhone = phone;

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

    if (formattedPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: formattedPhone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId = randomUUID();

    // Upload professional documents
    const docFiles = getFiles(req, "documents");
    const docUrls = docFiles.length ? await uploadFiles(docFiles, "professionals") : [];

    const userForToken = { id: userId, role: "professional" };
    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(userForToken);

    // Create user + professional profile
    const professionalProfileId = randomUUID();

    const transactionOps = [
      prisma.user.create({
        data: {
          id: userId,
          email,
          phone: formattedPhone,
          password_hash,
          role: "professional",
          refresh_token: refreshToken,
        },
      }),
      prisma.professionalProfile.create({
        data: {
          id: professionalProfileId,
          user_id: userId,
          full_name,
          specialty_type: specialty_type || "other",
          experience_years: experience_years
            ? parseInt(experience_years, 10)
            : null,
          wilaya,
          location_address,
          work_phone,
          bio,
          hourly_rate_dzd: hourly_rate_dzd
            ? parseFloat(hourly_rate_dzd)
            : null,
          work_type: resolvedWorkType,
          documents: docUrls.length ? docUrls : documents || [],
          status: "pending",
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
    await notifyAdmins("new_professional_registration", "Nouveau Professionnel", `Le professionnel ${full_name} s'est inscrit et attend votre approbation.`, userId);

    return res.status(201).json({
      message:
        "Professional registration submitted successfully, pending admin approval",
      accessToken,
      refreshToken
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

    // Cooldown check: 60 seconds
    if (user.email_otp_last_sent_at) {
      const secondsSinceLastSent = (Date.now() - new Date(user.email_otp_last_sent_at).getTime()) / 1000;
      if (secondsSinceLastSent < 60) {
        return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting a new code" });
      }
    }

    const otp = generateNumericOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_otp_hash: hashedOtp,
        email_otp_expires_at: expiresAt,
        email_otp_last_sent_at: new Date(),
        email_otp_attempts: 0, // Reset attempts on new OTP
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2>Verify your email address</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;

    await sendEmail(user.email, "Your Email Verification Code", html);

    return res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Code is required" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (!user.email_otp_hash || !user.email_otp_expires_at) {
      return res.status(400).json({ success: false, message: "No verification code requested" });
    }

    if (new Date() > new Date(user.email_otp_expires_at)) {
      return res.status(400).json({ success: false, message: "Verification code expired. Please request a new one." });
    }

    if (user.email_otp_attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new code." });
    }

    const hashedInputOtp = hashOTP(code);
    if (hashedInputOtp !== user.email_otp_hash) {
      // Increment attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { email_otp_attempts: { increment: 1 } },
      });
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_otp_hash: null,
        email_otp_expires_at: null,
        email_otp_last_sent_at: null,
        email_otp_attempts: 0,
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

    // Cooldown check: 60 seconds
    if (user.phone_otp_last_sent_at) {
      const secondsSinceLastSent = (Date.now() - new Date(user.phone_otp_last_sent_at).getTime()) / 1000;
      if (secondsSinceLastSent < 60) {
        return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting a new code" });
      }
    }

    const otp = generateNumericOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone_otp_hash: hashedOtp,
        phone_otp_expires_at: expiresAt,
        phone_otp_last_sent_at: new Date(),
        phone_otp_attempts: 0,
      },
    });

    await sendSMS(user.phone, `Votre code de verification est: ${otp}. Valable 5 minutes.`);

    return res.json({ success: true, message: "Verification SMS sent" });
  } catch (error) {
    next(error);
  }
};

const verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Code is required" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.phone_verified) {
      return res.status(400).json({ success: false, message: "Phone already verified" });
    }

    if (!user.phone_otp_hash || !user.phone_otp_expires_at) {
      return res.status(400).json({ success: false, message: "No verification code requested" });
    }

    if (new Date() > new Date(user.phone_otp_expires_at)) {
      return res.status(400).json({ success: false, message: "Verification code expired. Please request a new one." });
    }

    if (user.phone_otp_attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new code." });
    }

    const hashedInputOtp = hashOTP(code);
    if (hashedInputOtp !== user.phone_otp_hash) {
      // Increment attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { phone_otp_attempts: { increment: 1 } },
      });
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone_verified: true,
        phone_otp_hash: null,
        phone_otp_expires_at: null,
        phone_otp_last_sent_at: null,
        phone_otp_attempts: 0,
      },
    });

    return res.json({ success: true, message: "Phone verified successfully" });
  } catch (error) {
    next(error);
  }
};


const verifyRegistrationEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired pending token" });
    }

    if (decoded.type !== "pending") return res.status(401).json({ message: "Invalid token type" });

    const pending = await prisma.pendingRegistration.findUnique({ where: { id: decoded.pendingId } });
    if (!pending) return res.status(404).json({ message: "Pending registration not found" });

    if (new Date() > new Date(pending.otp_expires_at)) {
      return res.status(400).json({ success: false, message: "Verification code expired. Please request a new one." });
    }

    if (pending.otp_attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new code." });
    }

    const hashedInputOtp = hashOTP(code);
    if (hashedInputOtp !== pending.otp_hash) {
      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: { otp_attempts: { increment: 1 } },
      });
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    const userId = randomUUID();
    const userForToken = { id: userId, role: pending.role };
    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(userForToken);
    const regData = pending.registration_data;
    const files = pending.file_urls || {};

    let prismaTransaction = [];

    prismaTransaction.push(
      prisma.user.create({
        data: {
          id: userId,
          email: pending.email,
          phone: pending.phone,
          password_hash: pending.password_hash,
          role: pending.role,
          refresh_token: refreshToken,
          email_verified: true,
        },
      })
    );

    if (pending.role === 'customer') {
      prismaTransaction.push(
        prisma.clientProfile.create({
          data: {
            user_id: userId,
            full_name: regData.full_name,
            wilaya: regData.wilaya,
            address: regData.address,
            date_of_birth: regData.date_of_birth ? new Date(regData.date_of_birth) : undefined,
          },
        })
      );
    } else if (pending.role === 'store') {
      prismaTransaction.push(
        prisma.storeProfile.create({
          data: {
            user_id: userId,
            owner_name: regData.owner_name,
            store_name: regData.store_name,
            description: regData.description,
            address: regData.address,
            wilaya: regData.wilaya,
            location_coordinates: regData.location_coordinates,
            documents: files.documents || [],
            images: files.images || [],
            logo_url: files.logo_url || null,
            status: "pending",
            submitted_at: new Date(),
          },
        })
      );
    } else if (pending.role === 'professional') {
      prismaTransaction.push(
        prisma.professionalProfile.create({
          data: {
            user_id: userId,
            full_name: regData.full_name,
            specialty_type: regData.specialty_type,
            experience_years: regData.experience_years ? parseInt(regData.experience_years) : null,
            wilaya: regData.wilaya,
            location_address: regData.location_address,
            bio: regData.bio,
            hourly_rate_dzd: regData.hourly_rate_dzd ? parseFloat(regData.hourly_rate_dzd) : null,
            work_type: regData.work_type,
            documents: files.documents || [],
            status: "pending",
            submitted_at: new Date(),
          },
        })
      );
      if (regData.work_type === "avec_magasin") {
        prismaTransaction.push(
          prisma.storeProfile.create({
            data: {
              user_id: userId,
              owner_name: regData.full_name,
              store_name: regData.store_name,
              address: regData.store_address,
              wilaya: regData.store_wilaya,
              location_coordinates: regData.store_location,
              documents: files.store_documents || [],
              images: files.store_images || [],
              status: "pending",
              submitted_at: new Date(),
            },
          })
        );
      }
    }

    prismaTransaction.push(prisma.pendingRegistration.delete({ where: { id: pending.id } }));

    await prisma.$transaction(prismaTransaction);

    if (pending.role === 'store' || pending.role === 'professional') {
      const { notifyAdmins } = require("../services/notification.service");
      const title = pending.role === 'store' ? "Nouveau Magasin" : "Nouveau Professionnel";
      const name = pending.role === 'store' ? regData.store_name : regData.full_name;
      await notifyAdmins(`new_${pending.role}_registration`, title, `Le compte ${name} s'est inscrit et attend votre approbation.`, userId);
    } else if (pending.role === 'customer') {
      const { notifyAdmins } = require("../services/notification.service");
      await notifyAdmins("new_user_registration", "Nouveau Client", `Un nouveau client (${regData.full_name}) s'est inscrit sur la plateforme.`, userId);
    }

    return res.status(201).json({ message: "Registration verified successfully", accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

const resendRegistrationOtp = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired pending token" });
    }

    if (decoded.type !== "pending") return res.status(401).json({ message: "Invalid token type" });

    const pending = await prisma.pendingRegistration.findUnique({ where: { id: decoded.pendingId } });
    if (!pending) return res.status(404).json({ message: "Pending registration not found" });

    if (pending.otp_last_sent_at) {
      const secondsSinceLastSent = (Date.now() - new Date(pending.otp_last_sent_at).getTime()) / 1000;
      if (secondsSinceLastSent < 60) {
        return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting a new code" });
      }
    }

    const otp = generateNumericOTP();
    const hashedOtp = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: {
        otp_hash: hashedOtp,
        otp_expires_at: expiresAt,
        otp_last_sent_at: new Date(),
        otp_attempts: 0,
      }
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h2>Verify your email address</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;

    await sendEmail(pending.email, "Your Email Verification Code", html);

    return res.json({ success: true, message: "Verification email resent" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  googleAuth,
  register: registerCustomer,
  registerCustomer,
  registerStore,
  registerProfessional,
  registerAdmin,
  refreshToken,
  logout,
  verifyRegistrationEmail,
  resendRegistrationOtp,
  sendEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendPhoneVerification,
  verifyPhone,
};
