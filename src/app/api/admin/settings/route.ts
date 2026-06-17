import { NextRequest } from "next/server";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        storeName: body.storeName,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        address: body.address,
        instagram: body.instagram || null,
        facebook: body.facebook || null,
        taxRate: parseFloat(body.taxRate),
        kenyaShipping: parseFloat(body.kenyaShipping),
        eastAfricaShipping: parseFloat(body.eastAfricaShipping),
        intlShipping: parseFloat(body.intlShipping),
      },
      create: {
        id: "default",
        storeName: body.storeName,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        address: body.address,
      },
    });

    return apiSuccess(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, 403);
  }
}
