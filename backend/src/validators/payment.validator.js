const { z } = require("zod");

const initiatePaymentSchema = z.object({
  body: z.object({
    order_id: z.string().uuid(),
    method: z.enum(["edahabia", "cash_on_delivery"]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const edahabiaWebhookSchema = z.object({
  body: z.object({
    edahabia_ref: z.string().trim().min(1),
    status: z.enum(["success", "failed"]),
    failed_reason: z.string().trim().optional().nullable(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const paymentByOrderParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    order_id: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

module.exports = {
  initiatePaymentSchema,
  edahabiaWebhookSchema,
  paymentByOrderParamsSchema,
};
