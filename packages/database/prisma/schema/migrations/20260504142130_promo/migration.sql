-- AlterTable
ALTER TABLE "users" ALTER COLUMN "paymentPlanEndDate" SET DEFAULT NOW() + INTERVAL '3 days';

-- CreateTable
CREATE TABLE "promos" (
    "id" TEXT NOT NULL,
    "promo" TEXT NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promos_promo_key" ON "promos"("promo");
