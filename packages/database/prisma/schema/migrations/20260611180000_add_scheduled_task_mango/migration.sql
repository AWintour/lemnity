-- AlterTable: сопоставление Mango-команды с вебхуками статуса (Фаза 2)
ALTER TABLE "requests" ADD COLUMN "mango_command_id" TEXT;

-- CreateTable: отложенные задачи (planировщик обратного звонка)
CREATE TABLE "scheduled_tasks" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "execute_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_tasks_status_execute_at_idx" ON "scheduled_tasks"("status", "execute_at");
