-- Web Push-подписки персонала на уведомления о новых сообщениях чата (браузер/PWA).
-- Идемпотентно (IF NOT EXISTS / DO-guards).

CREATE TABLE IF NOT EXISTS "operator_push_subscriptions" (
  "id"          TEXT NOT NULL,
  "project_id"  TEXT NOT NULL,
  "user_id"     TEXT,
  "operator_id" TEXT,
  "endpoint"    TEXT NOT NULL,
  "p256dh"      TEXT NOT NULL,
  "auth"        TEXT NOT NULL,
  "user_agent"  TEXT,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operator_push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "operator_push_subscriptions_endpoint_key"
  ON "operator_push_subscriptions"("endpoint");
CREATE INDEX IF NOT EXISTS "operator_push_subscriptions_project_id_idx"
  ON "operator_push_subscriptions"("project_id");
CREATE INDEX IF NOT EXISTS "operator_push_subscriptions_user_id_idx"
  ON "operator_push_subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "operator_push_subscriptions_operator_id_idx"
  ON "operator_push_subscriptions"("operator_id");

DO $$ BEGIN
  ALTER TABLE "operator_push_subscriptions" ADD CONSTRAINT "operator_push_subscriptions_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
