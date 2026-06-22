-- CreateEnum
CREATE TYPE "PaymentOptionEnum" AS ENUM ('BRANDING');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CARD', 'INVOICE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentPlanEndDate" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '3 days',
ADD COLUMN     "paymentPlanId" TEXT,
ADD COLUMN     "paymentPlanStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usedTrialPeriod" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "payment_plan_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentOptionEnum" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_billed_annually" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plan_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "number_of_projects" INTEGER NOT NULL,
    "number_of_widgets" INTEGER NOT NULL,
    "monthly_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "quarterly_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "yearly_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promos" (
    "id" TEXT NOT NULL,
    "promo" TEXT NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PaymentPlanOptionsToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentPlanOptionsToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_planToPaymentOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_planToPaymentOptions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_planToIncludedOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_planToIncludedOptions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "promos_promo_key" ON "promos"("promo");

-- CreateIndex
CREATE INDEX "_PaymentPlanOptionsToUser_B_index" ON "_PaymentPlanOptionsToUser"("B");

-- CreateIndex
CREATE INDEX "_planToPaymentOptions_B_index" ON "_planToPaymentOptions"("B");

-- CreateIndex
CREATE INDEX "_planToIncludedOptions_B_index" ON "_planToIncludedOptions"("B");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "payment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentPlanOptionsToUser" ADD CONSTRAINT "_PaymentPlanOptionsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "payment_plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentPlanOptionsToUser" ADD CONSTRAINT "_PaymentPlanOptionsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_planToPaymentOptions" ADD CONSTRAINT "_planToPaymentOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_planToPaymentOptions" ADD CONSTRAINT "_planToPaymentOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "payment_plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_planToIncludedOptions" ADD CONSTRAINT "_planToIncludedOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_planToIncludedOptions" ADD CONSTRAINT "_planToIncludedOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "payment_plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
