-- Хранилище спинов виджета «Конвейер Удачи» (CONVEYOR_OF_LUCK) — клон механики
-- «Колеса фортуны». Отдельные таблицы + триггер-синхронизация строки-родителя
-- по типу виджета (как в 20260102234914_add_wheel_of_fortune_storage).

-- CreateTable
CREATE TABLE "conveyor_of_luck_spins" (
    "id" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "is_win" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conveyor_of_luck_spins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conveyor_of_luck_widgets" (
    "widget_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conveyor_of_luck_widgets_pkey" PRIMARY KEY ("widget_id")
);

-- CreateIndex
CREATE INDEX "conveyor_of_luck_spins_session_id_idx" ON "conveyor_of_luck_spins"("session_id");

-- CreateIndex
CREATE INDEX "conveyor_of_luck_spins_widget_id_idx" ON "conveyor_of_luck_spins"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "conveyor_of_luck_spins_widget_id_session_id_key" ON "conveyor_of_luck_spins"("widget_id", "session_id");

-- AddForeignKey
ALTER TABLE "conveyor_of_luck_spins" ADD CONSTRAINT "conveyor_of_luck_spins_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "conveyor_of_luck_widgets"("widget_id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "conveyor_of_luck_widgets" ("widget_id")
SELECT "id"
FROM "widgets"
WHERE "type" = 'CONVEYOR_OF_LUCK'
ON CONFLICT ("widget_id") DO NOTHING;

CREATE OR REPLACE FUNCTION "guard_conveyor_of_luck_widgets"()
RETURNS trigger AS $$
DECLARE
  widget_type "WidgetType";
BEGIN
  SELECT "type"
  INTO widget_type
  FROM "widgets"
  WHERE "id" = NEW."widget_id";

  IF widget_type IS NULL THEN
    RAISE EXCEPTION 'conveyor_of_luck_widgets.widget_id % does not exist in widgets', NEW."widget_id";
  END IF;

  IF widget_type <> 'CONVEYOR_OF_LUCK'::"WidgetType" THEN
    RAISE EXCEPTION 'widget % is not CONVEYOR_OF_LUCK', NEW."widget_id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "conveyor_of_luck_widgets_guard_trigger" ON "conveyor_of_luck_widgets";
CREATE TRIGGER "conveyor_of_luck_widgets_guard_trigger"
BEFORE INSERT OR UPDATE ON "conveyor_of_luck_widgets"
FOR EACH ROW EXECUTE FUNCTION "guard_conveyor_of_luck_widgets"();

CREATE OR REPLACE FUNCTION "sync_conveyor_of_luck_widget_row"()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM "conveyor_of_luck_widgets"
    WHERE "widget_id" = OLD."id";
    RETURN OLD;
  END IF;

  IF NEW."type" = 'CONVEYOR_OF_LUCK'::"WidgetType" THEN
    INSERT INTO "conveyor_of_luck_widgets" ("widget_id")
    VALUES (NEW."id")
    ON CONFLICT ("widget_id") DO NOTHING;
  ELSE
    DELETE FROM "conveyor_of_luck_widgets"
    WHERE "widget_id" = NEW."id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "widgets_sync_conveyor_of_luck_widget_trigger" ON "widgets";
CREATE TRIGGER "widgets_sync_conveyor_of_luck_widget_trigger"
AFTER INSERT OR UPDATE OF "type" ON "widgets"
FOR EACH ROW EXECUTE FUNCTION "sync_conveyor_of_luck_widget_row"();

DROP TRIGGER IF EXISTS "widgets_sync_conveyor_of_luck_widget_on_delete_trigger" ON "widgets";
CREATE TRIGGER "widgets_sync_conveyor_of_luck_widget_on_delete_trigger"
AFTER DELETE ON "widgets"
FOR EACH ROW EXECUTE FUNCTION "sync_conveyor_of_luck_widget_row"();
