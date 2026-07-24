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

const TEST_USER_EMAILS = ["customer@example.com"];

async function cleanup() {
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        in: TEST_USER_EMAILS,
      },
    },
    select: { id: true, email: true },
  });

  const testUserIds = testUsers.map((user) => user.id);

  console.log("Test users to remove:", testUsers.map((user) => user.email));

  if (testUserIds.length > 0) {
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: {
            in: testUserIds,
          },
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.account.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: {
            in: testUserIds,
          },
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.review.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.address.deleteMany({
      where: {
        userId: {
          in: testUserIds,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: testUserIds,
        },
      },
    });
  }

  console.log("Cleanup done ✅");
}

cleanup()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
