import "server-only";

const PAYSTACK_API_BASE = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export async function initializePaystackPayment(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["card", "mobile_money", "bank_transfer"],
      metadata: input.metadata,
    }),
  });

  const data = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Failed to initialize Paystack payment");
  }

  return data.data;
}
