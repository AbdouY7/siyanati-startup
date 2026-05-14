const { z } = require("zod");

const compatibilityCreateSchema = z.object({
  part_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  model_id: z.string().uuid(),
  year_from: z.coerce.number().int().min(1900),
  year_to: z.coerce.number().int().min(1900).optional().nullable(),
  engine_variant: z.string().optional().nullable(),
});

const compatibilityUpdateSchema = z.object({
  brand_id: z.string().uuid().optional(),
  model_id: z.string().uuid().optional(),
  year_from: z.coerce.number().int().min(1900).optional(),
  year_to: z.coerce.number().int().min(1900).optional().nullable(),
  engine_variant: z.string().optional().nullable(),
});

module.exports = {
  compatibilityCreateSchema,
  compatibilityUpdateSchema,
};
