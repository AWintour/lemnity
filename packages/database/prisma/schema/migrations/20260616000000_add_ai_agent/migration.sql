-- ИИ-агент чата: флаг авто-ответа бота на сообщении + кэш «знания» о сайте клиента.
-- Идемпотентно (IF NOT EXISTS / DO-guards).

-- Пометка ответа ИИ (sender='manager', но сгенерировано ботом). Для квоты и метки «ИИ» у оператора.
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "ai_generated" BOOLEAN NOT NULL DEFAULT false;

-- Индекс под подсчёт месячной квоты ИИ.
CREATE INDEX IF NOT EXISTS "chat_messages_ai_generated_created_at_idx" ON "chat_messages"("ai_generated", "created_at");

-- Кэш текстового знания о сайте/продукте клиента (один на проект).
CREATE TABLE IF NOT EXISTS "ai_site_knowledge" (
  "project_id" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_site_knowledge_pkey" PRIMARY KEY ("project_id")
);

DO $$ BEGIN
  ALTER TABLE "ai_site_knowledge" ADD CONSTRAINT "ai_site_knowledge_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
