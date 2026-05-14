const { z } = require("zod");

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

const deliveryTypeSchema = z.enum(["home_delivery", "store_pickup"]);

const createOrderSchema = z
  .object({
    body: z
      .object({
        store_id: z.string().uuid(),
        items: z
          .array(
            z.object({
              part_id: z.string().uuid(),
              quantity: z.coerce.number().int().min(1).max(100),
            }),
          )
          .min(1)
          .max(50),
        delivery_type: deliveryTypeSchema,
        delivery_address: z.string().trim().optional().nullable(),
        delivery_notes: z.string().trim().optional().nullable(),
        notes: z.string().trim().optional().nullable(),
        loyalty_points_used: z.coerce.number().int().min(0).default(0),
      })
      .superRefine((data, ctx) => {
        if (
          data.delivery_type === "home_delivery" &&
          !data.delivery_address?.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["delivery_address"],
            message: "delivery_address is required for home delivery",
          });
        }
      }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  });

const listOrdersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: orderStatusSchema.optional(),
    delivery_type: deliveryTypeSchema.optional(),
    from_date: z.coerce.date().optional(),
    to_date: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const orderIdParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: orderStatusSchema,
    cancellation_reason: z.string().trim().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

module.exports = {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
};
