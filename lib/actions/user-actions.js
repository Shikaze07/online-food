"use server";

import { prisma } from "@/lib/prisma";
import { userSchema, updateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";

export async function getUsers() {
  // connection() opts out of build-time prerendering so new users are always
  // visible on Vercel (production) — without this, Next.js 16 snapshots the
  // result at build time and new sign-ups never appear until a redeploy.
  await connection();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function createUser(data) {
  try {
    const validatedData = userSchema.parse(data);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    const { confirmPassword, ...userData } = validatedData;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/user-management");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: error.message || "Failed to create user" };
  }
}

export async function updateUser(id, data) {
  try {
    const validatedData = updateUserSchema.parse({ ...data, id });
    const { confirmPassword, ...userData } = validatedData;
    
    // If password is provided, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {
      delete userData.password; // Don't update password if empty
    }

    const user = await prisma.user.update({
      where: { id },
      data: userData,
    });

    revalidatePath("/admin/user-management");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: error.message || "Failed to update user" };
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/user-management");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}

import { getSession } from "@/lib/auth";

export async function getCustomerProfile() {
  try {
    const session = await getSession();
    let user = null;
    if (session && session.id) {
      user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });
    }

    return { user };
  } catch (error) {
    console.error("Failed to fetch customer profile:", error);
    return { error: "Failed to load profile" };
  }
}

export async function updateCustomerProfile(data) {
  try {
    const { id, firstName, middleName, lastName, phone, currentPassword, newPassword } = data;
    if (!id) return { error: "User ID is required" };

    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) return { error: "User not found" };

    const updateData = {
      firstName: firstName || currentUser.firstName,
      middleName: middleName ?? currentUser.middleName,
      lastName: lastName || currentUser.lastName,
      phone: phone ?? currentUser.phone,
    };

    if (newPassword) {
      if (!currentPassword) {
        return { error: "Current password is required to set a new password" };
      }
      const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isMatch) {
        return { error: "Current password is incorrect" };
      }
      if (newPassword.length < 8) {
        return { error: "New password must be at least 8 characters" };
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/customer/profile-management");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update customer profile:", error);
    return { error: error.message || "Failed to update profile" };
  }
}
