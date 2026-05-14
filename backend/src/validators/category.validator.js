const { z } = require("zod");

const categoryCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  icon_url: z.string().optional().nullable(),
});

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  icon_url: z.string().optional().nullable(),
});

module.exports = {
  categoryCreateSchema,
  categoryUpdateSchema,
};
