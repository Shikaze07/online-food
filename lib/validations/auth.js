import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Public sign-up is customer-only: there is intentionally no `role` field.
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .regex(/^[A-Za-zÀ-ÿ\s.'-]+$/, "Letters only, please"),
    middleName: z
      .string()
      .trim()
      .regex(/^[A-Za-zÀ-ÿ\s.'-]*$/, "Letters only, please")
      .optional()
      .or(z.literal("")),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .regex(/^[A-Za-zÀ-ÿ\s.'-]+$/, "Letters only, please"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^(09|\+639)\d{9}$/, "Enter a valid PH number (e.g. 09123456789)"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number")
      .regex(/[^a-zA-Z0-9]/, "Add a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
