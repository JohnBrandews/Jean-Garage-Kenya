import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "info@jeansgarage.co.ke",
          subject: `Contact: ${body.subject}`,
          html: `<p>From: ${body.name} (${body.email})</p><p>${body.message}</p>`,
        }),
      });
    }

    return apiSuccess({ sent: true });
  } catch {
    return apiError("Failed to send message", 500);
  }
}
