import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validatedData = updateUserSchema.parse({ ...body, id: parseInt(id) });

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    } else {
      delete validatedData.password;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
