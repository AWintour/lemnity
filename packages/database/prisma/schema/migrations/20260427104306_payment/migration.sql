-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CARD', 'INVOICE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" MONEY NOT NULL DEFAULT 0,
ADD COLUMN     "paymentPlanId" TEXT;

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "number_of_projects" INTEGER NOT NULL,
    "number_of_widgets" INTEGER NOT NULL,
    "monthly_price" MONEY NOT NULL DEFAULT 0,
    "quarterly_price" MONEY NOT NULL DEFAULT 0,
    "yearly_price" MONEY NOT NULL DEFAULT 0,
    "branding_price" MONEY NOT NULL DEFAULT 0,
    "options" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" MONEY NOT NULL DEFAULT 0,
    "type" "PaymentType" NOT NULL,
    "receipt_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "payment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
