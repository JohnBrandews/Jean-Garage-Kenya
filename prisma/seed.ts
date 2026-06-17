import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
  }),
});

const categories = [
  { name: "Jeans", slug: "jeans", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" },
  { name: "Tops", slug: "tops", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
  { name: "Footwear", slug: "footwear", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80" },
  { name: "Accessories", slug: "accessories", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80" },
  { name: "Outerwear", slug: "outerwear", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
  { name: "Limited Edition", slug: "limited-edition", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" },
];

const products = [
  {
    name: "Classic Slim Fit Denim",
    slug: "classic-slim-fit-denim",
    description: "Premium stretch denim with a modern slim fit. Crafted for comfort and style with reinforced stitching and a signature gold button detail.",
    price: 4500,
    compareAt: 5500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    ]),
    featured: true,
    isNew: true,
    isBestSeller: true,
    categorySlug: "jeans",
    sizes: [{ size: "30", stock: 15 }, { size: "32", stock: 20 }, { size: "34", stock: 18 }, { size: "36", stock: 12 }],
  },
  {
    name: "Vintage Wash Straight Leg",
    slug: "vintage-wash-straight-leg",
    description: "Authentic vintage wash with a relaxed straight leg cut. A timeless piece that pairs with everything in your wardrobe.",
    price: 5200,
    images: JSON.stringify(["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"]),
    featured: true,
    isBestSeller: true,
    categorySlug: "jeans",
    sizes: [{ size: "30", stock: 10 }, { size: "32", stock: 14 }, { size: "34", stock: 8 }],
  },
  {
    name: "Premium Leather Sneakers",
    slug: "premium-leather-sneakers",
    description: "Handcrafted leather sneakers with gold accent detailing. The perfect blend of luxury and street style.",
    price: 8500,
    compareAt: 9500,
    images: JSON.stringify(["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"]),
    featured: true,
    isNew: true,
    categorySlug: "footwear",
    sizes: [{ size: "40", stock: 8 }, { size: "41", stock: 10 }, { size: "42", stock: 12 }, { size: "43", stock: 6 }],
  },
  {
    name: "Gold Chain Necklace",
    slug: "gold-chain-necklace",
    description: "18K gold-plated chain necklace. A statement piece that elevates any outfit.",
    price: 3200,
    images: JSON.stringify(["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"]),
    isNew: true,
    categorySlug: "accessories",
    sizes: [{ size: "One Size", stock: 25 }],
  },
  {
    name: "Oversized Graphic Tee",
    slug: "oversized-graphic-tee",
    description: "Premium cotton oversized tee with exclusive JEANS GARAGE graphic print. Limited run.",
    price: 2800,
    images: JSON.stringify(["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"]),
    isBestSeller: true,
    categorySlug: "tops",
    sizes: [{ size: "S", stock: 20 }, { size: "M", stock: 25 }, { size: "L", stock: 18 }, { size: "XL", stock: 10 }],
  },
  {
    name: "Black Bomber Jacket",
    slug: "black-bomber-jacket",
    description: "Luxury bomber jacket in premium nylon with gold zipper accents. Water-resistant and lightweight.",
    price: 12000,
    compareAt: 14000,
    images: JSON.stringify(["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"]),
    featured: true,
    categorySlug: "outerwear",
    sizes: [{ size: "S", stock: 5 }, { size: "M", stock: 8 }, { size: "L", stock: 6 }, { size: "XL", stock: 4 }],
  },
  {
    name: "Distressed Skinny Jeans",
    slug: "distressed-skinny-jeans",
    description: "Edgy distressed skinny jeans with strategic rips and fading. Made from premium Japanese denim.",
    price: 5800,
    images: JSON.stringify(["https://images.unsplash.com/photo-1475178626626-a4ef9f8a9a8e?w=800&q=80"]),
    isNew: true,
    categorySlug: "jeans",
    sizes: [{ size: "28", stock: 8 }, { size: "30", stock: 12 }, { size: "32", stock: 10 }],
  },
  {
    name: "Leather Crossbody Bag",
    slug: "leather-crossbody-bag",
    description: "Genuine leather crossbody bag with adjustable strap and gold hardware. Perfect for everyday carry.",
    price: 6500,
    images: JSON.stringify(["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"]),
    isBestSeller: true,
    categorySlug: "accessories",
    sizes: [{ size: "One Size", stock: 15 }],
  },
];

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("Adminjean123!", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  await prisma.user.upsert({
    where: { email: "AdminJean@gmail.com" },
    update: {},
    create: {
      name: "Admin Jean",
      email: "AdminJean@gmail.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@example.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl },
      create: cat,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  for (const product of products) {
    const { categorySlug, sizes, ...data } = product;
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        categoryId,
        sizes: { create: sizes },
      },
    });
  }

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "JEANS GARAGE",
      email: "info@jeansgarage.co.ke",
      phone: "+254 700 123 456",
      whatsapp: "+254 700 123 456",
      address: "Westlands, Nairobi, Kenya",
      instagram: "https://instagram.com/jeansgaragekenya",
      facebook: "https://facebook.com/jeansgaragekenya",
    },
  });

  console.log("Seed completed!");
  console.log("Admin: AdminJean@gmail.com / Adminjean123!");
  console.log("Customer: customer@example.com / customer123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
