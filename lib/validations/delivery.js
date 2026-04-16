import { z } from "zod";

export const deliveryStatusSchema = z.object({
  status: z.enum(["ASSIGNED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"]),
  currentLocation: z.string().optional().or(z.literal("")),
});

export const updateDeliveryStatusSchema = deliveryStatusSchema.extend({
  id: z.number(),
});

export const assignDeliverySchema = z.object({
  orderId: z.number(),
  deliveryPersonId: z.number(),
});
