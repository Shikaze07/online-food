import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Pizza/Item name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  price: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? NaN : parseFloat(val)),
    z.number({ invalid_type_error: "Price is required" }).positive("Price must be greater than 0")
  ),
  category: z.enum(["Classic Pizzas", "Specialty Pizzas", "Sides & Appetizers", "Drinks", "Combos"], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  imageUrl: z.string().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

export const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.number(),
});
