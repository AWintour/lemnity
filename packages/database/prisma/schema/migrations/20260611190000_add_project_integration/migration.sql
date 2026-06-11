-- CreateTable: интеграция проекта (BYO Mango и др.), Фаза 2
CREATE TABLE "project_integrations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "api_key_enc" TEXT,
    "api_salt_enc" TEXT,
    "manager_type" TEXT,
    "manager_address" TEXT,
    "line_number" TEXT,
    "call_mode" TEXT,
    "delay_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_integrations_project_id_type_key" ON "project_integrations"("project_id", "type");

-- AddForeignKey
ALTER TABLE "project_integrations" ADD CONSTRAINT "project_integrations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
