const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const clientProfileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string(),
  wilaya: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().datetime().optional(),
  avatar_url: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(9).max(20),
  full_name: z.string().min(2),
  wilaya: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

// admin validation schema

const adminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(9).max(20),
  full_name: z.string().min(2), // optional, store in a separate field or skip
});

const storeRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(9).max(20),
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
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(9).max(20),
  specialty_type: z.enum([
    "mechanic",
    "electrician",
    "bodywork",
    "diagnostic",
    "other",
  ]),
  full_name: z.string().min(2),
  experience_years: z.coerce.number().int().nonnegative().optional(),
  wilaya: z.string().min(2),
  location_address: z.string().min(2).optional(),
  shop_images: z.array(z.string().url()).optional(),
  documents: z.array(z.string().url()).optional(),
  bio: z.string().optional(),
  hourly_rate_dzd: z.coerce.number().nonnegative().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  storeRegisterSchema,
  professionalRegisterSchema,
  clientProfileSchema,
  adminRegisterSchema,
};
