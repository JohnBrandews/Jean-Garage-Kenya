-- Add optional wholesale pricing to products.
ALTER TABLE "Product"
ADD COLUMN "wholesalePrice" DECIMAL(65,30),
ADD COLUMN "wholesaleMinQty" INTEGER NOT NULL DEFAULT 10;
