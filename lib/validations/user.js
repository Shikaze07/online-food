import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const userSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    middleName: z.string().optional().or(z.literal("")),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "CUSTOMER", "RIDER"]),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(09|\+639)\d{9}$/, "Please enter a valid PH phone number (e.g. 09123456789)"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateUserSchema = z
  .object({
    id: z.number(),
    firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
    middleName: z.string().optional().or(z.literal("")),
    lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    password: passwordSchema.optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["ADMIN", "CUSTOMER", "RIDER"]).optional(),
    phone: z
      .string()
      .regex(/^(09|\+639)\d{9}$/, "Please enter a valid PH phone number (e.g. 09123456789)")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => {
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
