import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]),
});

export const updateOrderStatusSchema = orderStatusSchema.extend({
  id: z.number(),
});
