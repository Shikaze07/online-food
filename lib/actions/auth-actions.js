"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, clearSession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/validations/auth";

export async function getCurrentUser() {
  const session = await getSession();
  return session;
}

export async function login(email, password) {
  try {
    if (!email || !password) {
      return { error: "Please provide both email and password" };
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    // 3. Create session with JWT
    await createSession(user);

    // 4. Return success with Role to allow client-side redirection, or handle redirect here.
    return { 
      success: true, 
      role: user.role 
    };
  } catch (error) {
    // Don't log sensitive error details
    return { error: "An unexpected error occurred during login" };
  }
}

export async function registerCustomer(data) {
  try {
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }
    const { confirmPassword, password, email, ...rest } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const user = await prisma.user.create({
      data: {
        ...rest,
        middleName: rest.middleName?.trim() || null,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role: "CUSTOMER", // always customer for public sign-up
      },
    });

    await createSession(user);
    return { success: true, role: user.role };
  } catch (error) {
    return { error: "Could not create your account. Please try again." };
  }
}

export async function logout() {
  await clearSession();
  redirect("/");
}
