const { z } = require("zod");
const validator = require("validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((val) => validator.isEmail(val), {
    message: "Invalid email format",
  });

const phoneSchema = z
  .string()
  .refine((val) => {
    const phoneNumber = parsePhoneNumberFromString(val, "DZ");
    return phoneNumber?.isValid();
  }, {
    message: "Invalid Algerian phone number",
  })
  .transform((val) => {
    const phoneNumber = parsePhoneNumberFromString(val, "DZ");
    return phoneNumber.format("E.164"); // +213XXXXXXXXX
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
});

const clientProfileSchema = z.object({
  full_name: z.string().optional(),
  phone: phoneSchema,
  wilaya: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().datetime().optional(),
  avatar_url: z.string().optional(),
});

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  phone: phoneSchema,
  full_name: z.string().min(2),
  wilaya: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

// admin validation schema

const adminRegisterSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  phone: phoneSchema,
  full_name: z.string().min(2), // optional, store in a separate field or skip
});

const storeRegisterSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  phone: phoneSchema,
  owner_name: z.string().min(2),
  store_name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().min(2),
  wilaya: z.string().min(2),
  location_coordinates: z.any().optional(),
  documents: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  logo_url: z.string().optional(),
});

const professionalRegisterSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  phone: phoneSchema,
  specialty_type: z.string().min(2),
  full_name: z.string().min(2),
  experience_years: z.coerce.number().int().nonnegative().optional(),
  wilaya: z.string().min(2),
  location_address: z.string().min(2).optional(),
  work_phone: z.string().optional(),
  documents: z.array(z.string().url()).optional(),
  bio: z.string().optional(),
  hourly_rate_dzd: z.coerce.number().nonnegative().optional(),
  work_type: z.enum(["individuel", "avec_magasin"]).optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  storeRegisterSchema,
  professionalRegisterSchema,
  clientProfileSchema,
  adminRegisterSchema,
};
