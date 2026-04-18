"use server";

import { prisma } from "@/lib/prisma";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { checkoutSchema } from "@/lib/validations/checkout";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        delivery: {
          include: {
            deliveryPerson: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { orders };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const validatedData = updateOrderStatusSchema.parse({ id, status });
    
    const order = await prisma.order.update({
      where: { id: validatedData.id },
      data: { status: validatedData.status },
    });

    revalidatePath("/admin/order-management");
    return { success: true, order };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { error: error.message || "Failed to update order status" };
  }
}

export async function deleteOrder(id) {
  try {
    // Note: Due to foreign key constraints, we might need to delete OrderItems first
    // if cascade delete is not set up in Prisma.
    // Based on the schema provided, it's safer to use an interactive transaction
    await prisma.$transaction(async (tx) => {
      // Delete associated data first if needed
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.delivery.deleteMany({ where: { orderId: id } });
      await tx.payment.deleteMany({ where: { orderId: id } });
      
      await tx.order.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/order-management");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { error: "Failed to delete order" };
  }
}

// Temporary mock for authentication
export async function getCurrentUser() {
  // Try to find a customer first
  let user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  
  // If no customer exists, fall back to the first available user (for demo/dev purposes)
  if (!user) {
    user = await prisma.user.findFirst();
  }
  
  return user || null;
}

export async function createOrder(data) {
  try {
    console.log("--- Starting Order Creation ---");
    const user = await getCurrentUser();
    if (!user) {
      console.error("Order failed: No user found in database.");
      return { error: "User not authenticated / No user found" };
    }
    console.log(`Creating order for user: ${user.name} (${user.id})`);

    const { items, address, paymentMethod, totalAmount, lat, lng } = data;
    
    // Validate checkout fields
    checkoutSchema.parse({ address, paymentMethod });
    console.log("Validation successful");

    if (!items || items.length === 0) {
      console.warn("Order failed: Cart is empty");
      return { error: "Cart is empty" };
    }

    console.log(`Processing ${items.length} items...`);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      console.log("1. Creating main order...");
      const order = await tx.order.create({
        data: {
          customerId: user.id,
          totalAmount,
          address,
          lat,
          lng,
          status: "PENDING",
        },
      });

      // 2. Create Order Items
      console.log("2. Creating order items...");
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // 3. Create Payment record
      console.log("3. Creating payment record...");
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          status: paymentMethod === "GCASH" ? "PAID" : "PENDING",
          paidAt: paymentMethod === "GCASH" ? new Date() : null,
        },
      });

      return order;
    });

    console.log(`Order created successfully: #${result.id}`);
    revalidatePath("/admin/order-management");
    return { success: true, orderId: result.id };
  } catch (error) {
    console.error("CRITICAL ERROR creating order:", error);
    return { error: error.message || "Failed to finalize order" };
  }
}
