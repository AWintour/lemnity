-- CreateTable: менеджеры проекта (Callback Widget, вкладка «Звонки»)
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "managers_project_id_idx" ON "managers"("project_id");

-- AddForeignKey
ALTER TABLE "managers" ADD CONSTRAINT "managers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: менеджер, назначенный на звонок (денормализация для списка/сводки)
ALTER TABLE "requests" ADD COLUMN "manager_id" TEXT;
ALTER TABLE "requests" ADD COLUMN "manager_name" TEXT;
ALTER TABLE "requests" ADD COLUMN "manager_address" TEXT;
ALTER TABLE "requests" ADD COLUMN "manager_type" TEXT;

-- CreateIndex
CREATE INDEX "requests_manager_id_idx" ON "requests"("manager_id");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
