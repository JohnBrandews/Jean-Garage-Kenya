import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function reset() {
  console.log("Starting full reset...");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  const nonAdminUsers = await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },
    select: { id: true, email: true },
  });

  const nonAdminIds = nonAdminUsers.map((user) => user.id);
  const nonAdminCartIds = nonAdminIds.length
    ? (
        await prisma.cart.findMany({
          where: {
            userId: {
              in: nonAdminIds,
            },
          },
          select: { id: true },
        })
      ).map((cart) => cart.id)
    : [];

  const nonAdminOrderIds = nonAdminIds.length
    ? (
        await prisma.order.findMany({
          where: {
            userId: {
              in: nonAdminIds,
            },
          },
          select: { id: true },
        })
      ).map((order) => order.id)
    : [];

  console.log("Admins preserved:", admins.map((admin) => admin.email));

  if (nonAdminCartIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: {
          in: nonAdminCartIds,
        },
      },
    });
  }
  console.log("OK Cart items cleared");

  await prisma.cart.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Carts cleared");

  if (nonAdminOrderIds.length > 0) {
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: nonAdminOrderIds,
        },
      },
    });
  }
  console.log("OK Order items cleared");

  await prisma.order.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Orders cleared");

  await prisma.review.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Reviews cleared");

  await prisma.address.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Addresses cleared");

  await prisma.session.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Sessions cleared");

  await prisma.account.deleteMany({
    where: {
      userId: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Accounts cleared");

  await prisma.user.deleteMany({
    where: {
      id: {
        in: nonAdminIds,
      },
    },
  });
  console.log("OK Test users cleared");

  await prisma.verificationToken.deleteMany({});
  console.log("OK Verification tokens cleared");

  console.log("\nFull reset complete!");
  console.log("Preserved: Products, Categories, Admin users, Store Settings");
}

reset()
  .catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
