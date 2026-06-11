-- AlterTable: итог звонка из вебхуков Mango (Фаза 2)
ALTER TABLE "requests" ADD COLUMN "call_duration_sec" INTEGER;
ALTER TABLE "requests" ADD COLUMN "call_recording_url" TEXT;
