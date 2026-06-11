-- AlterTable: bridge email↔lemnityUserId for account-level Callback subscription
ALTER TABLE "users" ADD COLUMN "lemnity_user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_lemnity_user_id_key" ON "users"("lemnity_user_id");

-- CreateTable
CREATE TABLE "callback_subscriptions" (
    "id" TEXT NOT NULL,
    "lemnity_user_id" TEXT NOT NULL,
    "modules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extra_manager" INTEGER NOT NULL DEFAULT 0,
    "extra_callbacks" INTEGER NOT NULL DEFAULT 0,
    "site_limit" INTEGER NOT NULL,
    "manager_limit" INTEGER NOT NULL DEFAULT 1,
    "callback_limit" INTEGER NOT NULL,
    "paid_until" TIMESTAMP(3),
    "last_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "callback_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "callback_subscriptions_lemnity_user_id_key" ON "callback_subscriptions"("lemnity_user_id");
