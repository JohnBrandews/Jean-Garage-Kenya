-- Add optional merchandising fields to products.
ALTER TABLE "Product"
ADD COLUMN "brand" TEXT,
ADD COLUMN "color" TEXT;
