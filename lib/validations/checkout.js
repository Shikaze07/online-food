import { z } from "zod";

export const checkoutSchema = z.object({
  address: z.string().min(5, "Please enter a valid delivery address"),
  paymentMethod: z.enum(["GCASH", "COD"], {
    required_error: "Please select a payment method",
  }),
});
