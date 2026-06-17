import { createConnection } from "node:net";
import { connect as createTlsConnection } from "node:tls";
import { prisma } from "@/lib/prisma";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type OrderItem = {
  quantity: number;
  size: string;
  price: { toString(): string } | number;
  product: { name: string };
};

type OrderRecord = {
  orderNumber: string;
  total: { toString(): string } | number;
  status: OrderStatus;
  paymentStatus: string;
  deliveryAddress: string;
  user: { name: string | null; email: string };
  items: OrderItem[];
};

function appUrl(path: string) {
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function orderLineItems(items: OrderItem[]) {
  return items
    .map((item) => `- ${item.product.name} x ${item.quantity} (Size ${item.size})`)
    .join("\n");
}

function buildCustomerHtml(order: OrderRecord, message: string) {
  const loginLink = appUrl(`/login?callbackUrl=${encodeURIComponent(`/track-order?orderNumber=${order.orderNumber}`)}`);
  const trackLink = appUrl(`/track-order?orderNumber=${order.orderNumber}`);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">JEANS GARAGE</h2>
      <p>${escapeHtml(message)}</p>
      <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
      <p><strong>Items:</strong></p>
      <pre style="background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(orderLineItems(order.items))}</pre>
      <p><strong>Track your order:</strong> <a href="${trackLink}">${trackLink}</a></p>
      <p>If you&apos;re not signed in yet, log in first here: <a href="${loginLink}">${loginLink}</a></p>
    </div>
  `;
}

function buildAdminHtml(order: OrderRecord, message: string) {
  const adminLink = appUrl("/admin/orders");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">JEANS GARAGE Admin</h2>
      <p>${escapeHtml(message)}</p>
      <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.user.name || "Customer")} (${escapeHtml(order.user.email)})</p>
      <p><strong>Items:</strong></p>
      <pre style="background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(orderLineItems(order.items))}</pre>
      <p><strong>Open dashboard:</strong> <a href="${adminLink}">${adminLink}</a></p>
    </div>
  `;
}

function normalizeFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || "JEANS GARAGE <no-reply@jeansgarage.co.ke>";
}

function buildMimeMessage({
  from,
  to,
  subject,
  textContent,
  htmlContent,
}: {
  from: string;
  to: string;
  subject: string;
  textContent: string;
  htmlContent: string;
}) {
  const boundary = `boundary_${Date.now().toString(36)}`;
  const subjectLine = subject.replaceAll("\r", "").replaceAll("\n", " ");

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subjectLine}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    textContent,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    htmlContent,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

async function sendViaSmtp({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  if (!host || !user || !pass) {
    return false;
  }

  const socket = secure
    ? createTlsConnection({ host, port, servername: host })
    : createConnection({ host, port });

  socket.setEncoding("utf8");

  let buffer = "";
  let pending:
    | {
        expected: number[];
        resolve: (value: string) => void;
        reject: (error: Error) => void;
      }
    | null = null;

  const waitFor = (expected: number[]) =>
    new Promise<string>((resolve, reject) => {
      pending = { expected, resolve, reject };
    });

  const send = (command: string) => {
    socket.write(`${command}\r\n`);
  };

  const readResponse = () => {
    while (buffer.includes("\n") && pending) {
      const index = buffer.indexOf("\n");
      const rawLine = buffer.slice(0, index).trimEnd();
      buffer = buffer.slice(index + 1);

      if (!rawLine) continue;

      const code = Number(rawLine.slice(0, 3));
      const separator = rawLine[3];
      const isFinalLine = separator === " ";

      if (pending.expected.includes(code) && isFinalLine) {
        const { resolve } = pending;
        pending = null;
        resolve(rawLine);
        return;
      }

      if (code >= 400 && isFinalLine) {
        const { reject } = pending;
        pending = null;
        reject(new Error(rawLine));
        return;
      }
    }
  };

  return new Promise<boolean>((resolve, reject) => {
    socket.on("data", (chunk) => {
      buffer += chunk;
      readResponse();
    });
    socket.on("error", reject);
    socket.on("close", () => resolve(true));

    (async () => {
      try {
        await waitFor([220]);
        send(`EHLO ${process.env.SMTP_HELO || "jeansgarage.co.ke"}`);
        await waitFor([250]);

        send("AUTH LOGIN");
        await waitFor([334]);
        send(Buffer.from(user).toString("base64"));
        await waitFor([334]);
        send(Buffer.from(pass).toString("base64"));
        await waitFor([235, 250]);

        send(`MAIL FROM:<${normalizeFromAddress().match(/<(.+)>/)?.[1] || "no-reply@jeansgarage.co.ke"}>`);
        await waitFor([250]);
        send(`RCPT TO:<${to}>`);
        await waitFor([250, 251]);
        send("DATA");
        await waitFor([354]);
        socket.write(`${buildMimeMessage({ from: normalizeFromAddress(), to, subject, textContent, htmlContent })}\r\n.\r\n`);
        await waitFor([250]);
        send("QUIT");
        socket.end();
        resolve(true);
      } catch (error) {
        socket.destroy();
        reject(error);
      }
    })();
  });
}

async function sendViaBrevo({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  if (!process.env.BREVO_API_KEY) return false;

  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@jeansgarage.co.ke";
  const fromName = process.env.BREVO_FROM_NAME || "JEANS GARAGE";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    }),
  });

  return response.ok;
}

async function sendNotificationEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const smtpSent = await sendViaSmtp({ to, subject, htmlContent, textContent });
  if (smtpSent) return;
  await sendViaBrevo({ to, subject, htmlContent, textContent });
}

export async function notifyOrderCreated(orderId: string) {
  const [order, admins, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { name: true, email: true },
    }),
    prisma.storeSettings.findFirst({ select: { email: true, storeName: true } }),
  ]);

  if (!order) return;

  const customerMessage =
    "Your JEANS GARAGE order has been received. We're preparing your pieces now and you can track every stage from your account dashboard.";
  const adminMessage = "A new order has been placed and is waiting in the dashboard for review.";

  const recipients = new Set<string>();
  const adminRecipients = admins
    .map((admin) => admin.email)
    .concat(settings?.email ? [settings.email] : [])
    .filter((email) => {
      if (recipients.has(email)) return false;
      recipients.add(email);
      return true;
    });

  await Promise.allSettled([
    sendNotificationEmail({
      to: order.user.email,
      subject: `Your JEANS GARAGE order ${order.orderNumber} has been received`,
      htmlContent: buildCustomerHtml(order as OrderRecord, customerMessage),
      textContent: `${customerMessage}\n\nTrack: ${appUrl(`/track-order?orderNumber=${order.orderNumber}`)}`,
    }),
    ...adminRecipients.map((email) =>
      sendNotificationEmail({
        to: email,
        subject: `New JEANS GARAGE order received: ${order.orderNumber}`,
        htmlContent: buildAdminHtml(order as OrderRecord, adminMessage),
        textContent: `${adminMessage}\n\nOpen dashboard: ${appUrl("/admin/orders")}`,
      })
    ),
  ]);
}

export async function notifyOrderStatusChanged(orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) return;

  const messages: Record<OrderStatus, string> = {
    PENDING: "Your order status is pending review.",
    PAID: "Payment has been received for your order.",
    PROCESSING: "Your JEANS GARAGE order is now being processed.",
    SHIPPED: "Your order has been dispatched and is on the way.",
    DELIVERED: "Your order has been delivered and marked complete.",
    CANCELLED: "Your order has been cancelled.",
  };

  await sendNotificationEmail({
    to: order.user.email,
    subject: `JEANS GARAGE order ${order.orderNumber} is now ${status.toLowerCase()}`,
    htmlContent: buildCustomerHtml(order as OrderRecord, messages[status]),
    textContent: `${messages[status]}\n\nTrack: ${appUrl(`/track-order?orderNumber=${order.orderNumber}`)}`,
  });
}
