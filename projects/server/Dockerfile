# Production Dockerfile для NestJS сервера
FROM node:20.19.0-alpine

# Устанавливаем рабочую директорию
WORKDIR /server

# Устанавливаем pnpm глобально
RUN npm install -g pnpm@10.15.1

# Копируем только файлы зависимостей
COPY projects/server/package*.json ./
COPY pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN pnpm install --filter server

# Копируем исходный код
COPY projects/server/ ./

# Собираем приложение
RUN pnpm run build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["pnpm", "--filter", "server", "run", "start:prod"]
