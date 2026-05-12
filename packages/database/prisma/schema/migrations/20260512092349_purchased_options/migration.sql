/*
  Warnings:

  - You are about to drop the `_PaymentPlanOptionsToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PaymentPlanOptionsToUser" DROP CONSTRAINT "_PaymentPlanOptionsToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PaymentPlanOptionsToUser" DROP CONSTRAINT "_PaymentPlanOptionsToUser_B_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "paymentPlanEndDate" SET DEFAULT NOW() + INTERVAL '3 days';

-- DropTable
DROP TABLE "_PaymentPlanOptionsToUser";

-- CreateTable
CREATE TABLE "purchased_payment_plan_options" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentPlanOptionId" TEXT NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchased_payment_plan_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchased_payment_plan_options_userId_paymentPlanOptionId_key" ON "purchased_payment_plan_options"("userId", "paymentPlanOptionId");

-- AddForeignKey
ALTER TABLE "purchased_payment_plan_options" ADD CONSTRAINT "purchased_payment_plan_options_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchased_payment_plan_options" ADD CONSTRAINT "purchased_payment_plan_options_paymentPlanOptionId_fkey" FOREIGN KEY ("paymentPlanOptionId") REFERENCES "payment_plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
