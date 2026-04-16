import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  price: z.preprocess((val) => parseFloat(val), z.number().min(0, "Price must be at least 0")),
  category: z.enum(["Classic Burgers", "Specialty Burgers", "Sides & Fries", "Drinks", "Combos"]),
  imageUrl: z.string().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

export const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.number(),
});
