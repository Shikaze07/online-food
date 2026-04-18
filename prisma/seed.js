import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@gmail.com" },
    });

    if (existingAdmin) {
      console.log("Admin account already exists. Skipping...");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@gmail.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
      },
    });

    console.log("✓ Admin account created successfully");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`  Role: ${admin.role}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
