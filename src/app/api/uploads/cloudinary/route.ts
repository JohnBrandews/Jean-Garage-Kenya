import { Readable } from "node:stream";
import { NextRequest } from "next/server";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api-utils";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

function uploadStream(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    Readable.from([buffer]).pipe(stream);
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    if (!cloudinaryConfigured) {
      return apiError("Cloudinary is not configured", 500);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "jeans-garage/products");

    if (!(file instanceof File)) {
      return apiError("A file is required", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadStream(buffer, folder);

    return apiSuccess(uploaded, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    if (message === "Unauthorized") return apiError("Unauthorized", 401);
    if (message === "Forbidden") return apiError("Forbidden", 403);
    return apiError(message, 500);
  }
}
