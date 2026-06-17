import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().uuid(),
  images: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  sizes: z.array(
    z.object({
      size: z.string(),
      stock: z.coerce.number().int().min(0),
    })
  ),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  imageUrl: z.string().optional().nullable(),
});

export const addressSchema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  county: z.string().optional(),
  country: z.string().default("Kenya"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  county: z.string().optional(),
  country: z.string().default("Kenya"),
  postalCode: z.string().optional(),
  shippingRegion: z.enum(["KENYA", "EAST_AFRICA", "INTERNATIONAL"]),
  paymentMethod: z.enum(["PAYSTACK", "MPESA", "CARD"]),
  currency: z.enum(["KES", "USD"]).default("KES"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
