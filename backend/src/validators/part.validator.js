const { z } = require("zod");

const partConditionSchema = z.enum(["new", "used", "refurbished"]);

const partCreateSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  oem_reference: z.string().optional().nullable(),
  condition: partConditionSchema.optional(),
  price_dzd: z.coerce.number().positive(),
  stock_qty: z.coerce.number().int().nonnegative().optional(),
  weight_kg: z.coerce.number().positive().optional().nullable(),
  images: z.array(z.string()).optional(),
});

const partUpdateSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  oem_reference: z.string().optional().nullable(),
  condition: partConditionSchema.optional(),
  price_dzd: z.coerce.number().positive().optional(),
  stock_qty: z.coerce.number().int().nonnegative().optional(),
  weight_kg: z.coerce.number().positive().optional().nullable(),
  images: z.array(z.string()).optional(),
});

const partVerifySchema = z.object({
  is_verified: z.boolean(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

const partBulkCreateSchema = z.array(
  z.object({
    category_id: z.string().uuid().optional().nullable(),
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    oem_reference: z.string().optional().nullable(),
    condition: partConditionSchema.optional(),
    price_dzd: z.coerce.number().positive(),
    stock_qty: z.coerce.number().int().nonnegative().optional(),
    weight_kg: z.coerce.number().positive().optional().nullable(),
  })
);

module.exports = {
  partCreateSchema,
  partUpdateSchema,
  partVerifySchema,
  partBulkCreateSchema,
};
