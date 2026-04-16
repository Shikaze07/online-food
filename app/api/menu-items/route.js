import { prisma } from "@/lib/prisma";
import { menuItemSchema } from "@/lib/validations/menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menuItems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const validatedData = menuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.create({
      data: validatedData,
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create menu item" }, { status: 400 });
  }
}
