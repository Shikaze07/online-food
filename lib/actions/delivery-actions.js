"use server";

import { prisma } from "@/lib/prisma";
import { updateDeliveryStatusSchema, assignDeliverySchema } from "@/lib/validations/delivery";
import { revalidatePath } from "next/cache";

export async function getDeliveries() {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        deliveryPerson: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return { deliveries };
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    return { error: "Failed to fetch deliveries" };
  }
}

export async function getRiderDeliveries(riderId) {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        deliveryPersonId: parseInt(riderId),
        status: {
          not: "DELIVERED",
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  }
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { deliveries };
  } catch (error) {
    console.error("Failed to fetch rider deliveries:", error);
    return { error: "Failed to fetch rider deliveries" };
  }
}

export async function getRiderActiveDelivery(riderId) {
  try {
    const delivery = await prisma.delivery.findFirst({
      where: {
        deliveryPersonId: parseInt(riderId),
        status: {
          in: ["PICKED_UP", "ON_THE_WAY"],
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  }
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { delivery };
  } catch (error) {
    console.error("Failed to fetch active delivery:", error);
    return { error: "Failed to fetch active delivery", delivery: null };
  }
}

export async function getDeliveryPersonnel() {
  try {
    const personnel = await prisma.user.findMany({
      where: { 
        role: "RIDER",
        deliveries: {
          none: {
            status: {
              not: "DELIVERED"
            }
          }
        }
      },
      orderBy: { firstName: "asc" },
    });
    return { personnel };
  } catch (error) {
    console.error("Failed to fetch delivery personnel:", error);
    return { error: "Failed to fetch delivery personnel" };
  }
}

export async function updateDeliveryStatus(id, data) {
  try {
    const validatedData = updateDeliveryStatusSchema.parse({ id, ...data });
    
    // Update delivery with minimal data fetch to improve performance
    const updatedDelivery = await prisma.delivery.update({
      where: { id: validatedData.id },
      data: {
        status: validatedData.status,
        currentLocation: validatedData.currentLocation,
      },
      select: {
        id: true,
        orderId: true,
      },
    });

    // Update order status separately
    if (validatedData.status === "DELIVERED") {
      await prisma.order.update({
        where: { id: updatedDelivery.orderId },
        data: { status: "COMPLETED" },
      });
    } else if (validatedData.status === "PICKED_UP" || validatedData.status === "ON_THE_WAY") {
      await prisma.order.update({
        where: { id: updatedDelivery.orderId },
        data: { status: "OUT_FOR_DELIVERY" },
      });
    }

    revalidatePath("/admin/delivery-management");
    revalidatePath("/admin/order-management");
    return { success: true, delivery: updatedDelivery };
  } catch (error) {
    console.error("Failed to update delivery status:", error);
    return { error: error.message || "Failed to update delivery status" };
  }
}

export async function assignDelivery(orderId, deliveryPersonId) {
  try {
    const validatedData = assignDeliverySchema.parse({ orderId, deliveryPersonId });
    
    // Check if order already has delivery
    const existing = await prisma.delivery.findUnique({
      where: { orderId: validatedData.orderId }
    });

    if (existing) {
      return { error: "Order already has an assigned delivery" };
    }

    // Check if rider already has an active delivery
    const activeRiderDelivery = await prisma.delivery.findFirst({
      where: {
        deliveryPersonId: validatedData.deliveryPersonId,
        status: {
          not: "DELIVERED"
        }
      }
    });

    if (activeRiderDelivery) {
      return { error: "Rider already has an active delivery assignment" };
    }

    // Create delivery without transaction to avoid timeout
    const newDelivery = await prisma.delivery.create({
      data: {
        orderId: validatedData.orderId,
        deliveryPersonId: validatedData.deliveryPersonId,
        status: "ASSIGNED",
      },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    // Update Order status separately
    await prisma.order.update({
      where: { id: validatedData.orderId },
      data: { status: "PREPARING" },
    });

    revalidatePath("/admin/delivery-management");
    revalidatePath("/admin/order-management");
    return { success: true, delivery: newDelivery };
  } catch (error) {
    console.error("Failed to assign delivery:", error);
    return { error: error.message || "Failed to assign delivery" };
  }
}

export async function deleteDelivery(id) {
  try {
    await prisma.delivery.delete({
      where: { id },
    });

    revalidatePath("/admin/delivery-management");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete delivery:", error);
    return { error: "Failed to delete delivery" };
  }
}
