-- Сид промокода LEMNITY20 (скидка 20%).
-- Идемпотентно: повторный прогон не создаёт дублей и не трогает существующую запись.
INSERT INTO "promos" ("id", "promo", "discount")
VALUES (gen_random_uuid()::text, 'LEMNITY20', 20)
ON CONFLICT ("promo") DO NOTHING;
