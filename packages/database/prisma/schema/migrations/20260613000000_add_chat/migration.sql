-- Виджет «Чат» (CHAT): новое значение enum + таблицы диалогов и сообщений.
-- Идемпотентно (IF NOT EXISTS / DO-guards), т.к. на части окружений объекты уже созданы вручную.

ALTER TYPE "WidgetType" ADD VALUE IF NOT EXISTS 'CHAT';

DO $$ BEGIN
  CREATE TYPE "ChatConversationStatus" AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ChatMessageSender" AS ENUM ('visitor', 'manager', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "chat_conversations" (
  "id" TEXT NOT NULL,
  "seq" SERIAL NOT NULL,
  "project_id" TEXT NOT NULL,
  "widget_id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "status" "ChatConversationStatus" NOT NULL DEFAULT 'open',
  "visitor_name" TEXT,
  "visitor_phone" TEXT,
  "visitor_email" TEXT,
  "last_message_at" TIMESTAMP(3),
  "last_message_preview" TEXT,
  "unread_for_manager" INTEGER NOT NULL DEFAULT 0,
  "unread_for_visitor" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_conversations_seq_key" ON "chat_conversations"("seq");
CREATE UNIQUE INDEX IF NOT EXISTS "chat_conversations_widget_id_session_id_key" ON "chat_conversations"("widget_id", "session_id");
CREATE INDEX IF NOT EXISTS "chat_conversations_project_id_idx" ON "chat_conversations"("project_id");
CREATE INDEX IF NOT EXISTS "chat_conversations_widget_id_idx" ON "chat_conversations"("widget_id");
CREATE INDEX IF NOT EXISTS "chat_conversations_status_idx" ON "chat_conversations"("status");
CREATE INDEX IF NOT EXISTS "chat_conversations_last_message_at_idx" ON "chat_conversations"("last_message_at");

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "sender" "ChatMessageSender" NOT NULL,
  "body" TEXT NOT NULL,
  "sender_user_id" TEXT,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "chat_messages_conversation_id_created_at_idx" ON "chat_messages"("conversation_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_widget_id_fkey"
    FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
