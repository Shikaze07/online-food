"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

export async function logout() {
  await clearSession();
  redirect("/login");
}
