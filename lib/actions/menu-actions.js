"use server";

import { prisma } from "@/lib/prisma";
import { menuItemSchema, updateMenuItemSchema } from "@/lib/validations/menu";
import { revalidatePath } from "next/cache";

export async function getMenuItems() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { createdAt: "desc" },
    });


    return { menuItems };
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return { error: "Failed to fetch menu items" };
  }
}

export async function createMenuItem(data) {
  try {
    const validatedData = menuItemSchema.parse(data);
    
    const menuItem = await prisma.menuItem.create({
      data: validatedData,
    });

    revalidatePath("/admin/menu-management");
    return { success: true, menuItem };
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return { error: error.message || "Failed to create menu item" };
  }
}

export async function updateMenuItem(id, data) {
  try {
    const validatedData = updateMenuItemSchema.parse({ ...data, id });
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/menu-management");
    return { success: true, menuItem };
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return { error: error.message || "Failed to update menu item" };
  }
}

export async function toggleMenuItemAvailability(id, currentStatus) {
  try {
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !currentStatus },
    });

    revalidatePath("/admin/menu-management");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle availability:", error);
    return { error: "Failed to toggle availability" };
  }
}

export async function deleteMenuItem(id) {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });

    revalidatePath("/admin/menu-management");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { error: "Failed to delete menu item" };
  }
}
