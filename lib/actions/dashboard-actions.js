"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      totalOrders,
      todayOrders,
      statusGroups,
      revenueAgg,
      todayRevenueAgg,
      customers,
      riders,
      menuItems,
      recentOrders,
      weekOrders,
      topGroups,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startOfToday } },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "RIDER" } }),
      prisma.menuItem.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const names = await prisma.menuItem.findMany({
      where: { id: { in: topGroups.map((g) => g.menuItemId) } },
      select: { id: true, name: true },
    });
    const nameMap = Object.fromEntries(names.map((n) => [n.id, n.name]));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      days.push({
        key: d.toDateString(),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        orders: 0,
        revenue: 0,
      });
    }
    for (const o of weekOrders) {
      const day = days.find((d) => d.key === new Date(o.createdAt).toDateString());
      if (day) {
        day.orders += 1;
        day.revenue += Number(o.totalAmount);
      }
    }

    const statusCounts = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));

    return {
      stats: {
        totalOrders,
        todayOrders,
        revenue: Number(revenueAgg._sum.totalAmount || 0),
        todayRevenue: Number(todayRevenueAgg._sum.totalAmount || 0),
        customers,
        riders,
        menuItems,
        statusCounts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString(),
        customer: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—",
      })),
      weekly: days.map(({ label, orders, revenue }) => ({ label, orders, revenue })),
      topItems: topGroups.map((g) => ({
        name: nameMap[g.menuItemId] || "Item",
        quantity: g._sum.quantity || 0,
      })),
    };
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    return { error: "Failed to load dashboard stats" };
  }
}

export async function getDashboardOrders(page = 1, pageSize = 5) {
  try {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validPageSize = Math.max(1, parseInt(pageSize) || 5);
    const skip = (validPage - 1) * validPageSize;

    const [total, orders] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        skip,
        take: validPageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
          orderItems: {
            select: {
              quantity: true,
              menuItem: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      total,
      totalPages: Math.max(1, Math.ceil(total / validPageSize)),
      page: validPage,
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString(),
        customer: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—",
        itemSummary:
          o.orderItems?.slice(0, 2).map((i) => `${i.quantity}× ${i.menuItem?.name || "Item"}`).join(", ") +
          (o.orderItems?.length > 2 ? ` +${o.orderItems.length - 2} more` : ""),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard orders:", error);
    return { error: "Failed to fetch orders", orders: [], total: 0, totalPages: 1, page: 1 };
  }
}

