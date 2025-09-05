# Этап сборки - используем стабильную LTS версию Node 20.19.0
FROM node:20.19.0-alpine AS builder

WORKDIR /client

# Устанавливаем pnpm (версия из проекта)
RUN npm install -g pnpm@10.15.1

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN pnpm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN pnpm run build

# Этап продакшена - используем стабильную версию Nginx 1.25.4
FROM nginx:1.25.4-alpine

# Копируем собранное приложение
COPY --from=builder /client/dist /usr/share/nginx/html

# Открываем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
