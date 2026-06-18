import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid registration data", 400);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existing) return apiError("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        password: hashedPassword,
      },
    });

    return apiSuccess({ id: user.id, email: user.email }, 201);
  } catch {
    return apiError("Registration failed", 500);
  }
}
