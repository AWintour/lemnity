-- Добавляем новое значение enum отдельной миграцией: PostgreSQL не позволяет
-- использовать только что добавленное значение enum в той же транзакции, где оно
-- создано. Поэтому INSERT/триггеры с 'CONVEYOR_OF_LUCK' — в следующей миграции.
ALTER TYPE "WidgetType" ADD VALUE IF NOT EXISTS 'CONVEYOR_OF_LUCK';
