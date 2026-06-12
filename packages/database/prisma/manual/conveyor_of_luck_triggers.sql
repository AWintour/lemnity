-- ============================================================================
-- Конвейер Удачи (CONVEYOR_OF_LUCK) — guard/sync ТРИГГЕРЫ + бэкафилл строки-родителя.
--
-- ЗАЧЕМ: прод деплоит схему через `prisma db push` (см. deploy.sh), который синхронизирует
-- модели/enum/индексы/FK, но НЕ выполняет raw-SQL функции и триггеры из migration.sql.
-- Спин конвейера (`conveyorOfLuckSpin.create` → `conveyorWidget.connect`) ТРЕБУЕТ строку-родителя
-- в `conveyor_of_luck_widgets`, которую создаёт триггер на таблице `widgets`. Без этого блока
-- создание/спин конвейера в проде упадёт.
--
-- КОГДА ПРИМЕНЯТЬ: один раз на каждую среду (прод/стейдж) ПОСЛЕ `prisma db push`
-- (т.е. после того как таблицы `conveyor_of_luck_widgets` / `conveyor_of_luck_spins` уже созданы).
-- Тем же путём, что применялись триггеры «Колеса фортуны».
--
-- БЕЗОПАСНОСТЬ: блок ИДЕМПОТЕНТЕН (CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS + CREATE,
-- INSERT ... ON CONFLICT DO NOTHING) — можно прогонять повторно.
--
-- КАК ПРИМЕНИТЬ:
--   psql "$DATABASE_URL" -f packages/database/prisma/manual/conveyor_of_luck_triggers.sql
-- или в docker-compose.prod.yml окружении:
--   docker compose -f docker-compose.prod.yml exec -T postgres \
--     psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < packages/database/prisma/manual/conveyor_of_luck_triggers.sql
--
-- Источник истины — миграция 20260612100001_add_conveyor_of_luck_storage (строки 37-100).
-- ============================================================================

-- Бэкафилл: строки-родители для уже существующих виджетов CONVEYOR_OF_LUCK.
INSERT INTO "conveyor_of_luck_widgets" ("widget_id")
SELECT "id"
FROM "widgets"
WHERE "type" = 'CONVEYOR_OF_LUCK'
ON CONFLICT ("widget_id") DO NOTHING;

-- Guard: запрещает вставку строки-родителя для виджета не того типа / несуществующего.
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

-- Sync: создаёт/удаляет строку-родителя при insert/update(type)/delete виджета.
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
