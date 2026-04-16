"use server";

import { prisma } from "@/lib/prisma";
import { userSchema, updateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
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
