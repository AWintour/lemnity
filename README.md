# Full-Stack Monorepo Template

Универсальный темплейт для создания полноценных веб-приложений с использованием pnpm workspaces.

## 🚀 Быстрый старт разработки
```bash
pnpm install && pnpm dev
```

## 🛠️ Технологии

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand + Axios
- **Backend**: NestJS + TypeScript + Prisma
- **Database**: PostgreSQL
- **Package Manager**: pnpm workspaces
- **Linting**: ESLint + Prettier

## 🛠️ Рекомендуемые плагины для IDE

Для максимального комфорта разработки установите в **Cursor/VS Code**:

- **Prisma** (`Prisma.prisma`) - подсветка синтаксиса и автодополнение для `.prisma`
- **Tailwind CSS** (`bradlc.vscode-tailwindcss`) - автодополнение CSS классов
- **ESLint** (`dbaeumer.vscode-eslint`) - проверка кода
- **Prettier** (`esbenp.prettier-vscode`) - автоматическое форматирование

## 📦 Установка и настройка

### 1. Установка зависимостей

```bash
# Установить все зависимости
pnpm install

# Или по частям
pnpm install:all      # Все проекты
pnpm install:client   # Только клиент
pnpm install:server   # Только сервер
pnpm install:clean    # Полная очистка и переустановка
```

### 2. Переменные окружения

Создайте `.env` файлы:

```env
# projects/client/.env
VITE_API_URL=http://localhost/api

# projects/server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 3. Работа с базой данных

**Примечание:** В проекте, в качестве примера использования, приведена разделённая Prisma-схема:
- `prisma/schema/schema.prisma` - основная конфигурация
- `prisma/schema/users.prisma` - модель пользователей
- `prisma/schema/posts.prisma` - модель постов

Основные команды для работы с Prisma:

```bash
# Открыть Prisma Studio (веб-интерфейс для просмотра БД)
pnpm --filter server exec npx prisma studio

# Сгенерировать Prisma Client (после изменения схемы)
pnpm --filter server exec npx prisma generate

# Получить схему из существующей БД
pnpm --filter server exec npx prisma db pull

# Отправить схему в БД (создать/обновить таблицы)
pnpm --filter server exec npx prisma db push

# Создать миграцию (рекомендуется для продакшена)
pnpm --filter server exec npx prisma migrate dev --name init

# Применить миграции
pnpm --filter server exec npx prisma migrate deploy

# Сбросить БД и применить все миграции заново
pnpm --filter server exec npx prisma migrate reset
```

**Краткое описание команд:**
- **`prisma studio`** - веб-интерфейс для просмотра и редактирования данных в базе
- **`prisma generate`** - создает TypeScript клиент на основе схемы (обязательно после изменения схемы)
- **`prisma db pull`** - импортирует схему из существующей базы данных
- **`prisma db push`** - применяет схему к базе данных (создает/обновляет таблицы)
- **`prisma migrate dev`** - создает новую миграцию на основе изменений схемы
- **`prisma migrate deploy`** - применяет существующие миграции к БД
- **`prisma migrate reset`** - сбрасывает БД и применяет все миграции заново (только для разработки!)

## 🚀 Разработка

### Запуск в режиме разработки

```bash
# Запустить и клиент, и сервер
pnpm dev

# Только клиент
pnpm dev:client

# Только сервер
pnpm dev:server
```

### Сборка проекта

```bash
# Собрать все проекты
pnpm build

# Или по отдельности
pnpm build:client
pnpm build:server
```

### Управление зависимостями

```bash
# В клиент
pnpm --filter client add new-package

# В сервер
pnpm --filter server add new-package

# В корень (общая зависимость)
pnpm add -w new-package
```

### Линтинг и форматирование

```bash
# Весь проект
pnpm --recursive run lint   
pnpm format                 # Проверка форматирования
pnpm format:fix             # Исправление форматирования

# Только клиент
pnpm --filter client run lint
pnpm --filter client run format:check
pnpm --filter client run format:fix

# Только сервер
pnpm --filter server run lint
pnpm --filter server run format
```

## 🚀 Развертывание

**Структура монорепо:**
```
root/
├── projects/
│   ├── client/          # React приложение
│   ├── server/          # NestJS API сервер
│   └── nginx/           # Nginx конфигурация
├── packages/             # Общие пакеты
└── docker-compose.yml    # Docker конфигурация
```

### 1. Структура для развертывания

```
dist/
├── client/           # Собранный React (HTML, CSS, JS)
└── server/           # Собранный NestJS (main.js)
```

### 2. Переменные окружения для продакшена

#### Для Docker Compose (.env)

```env
# PostgreSQL
POSTGRES_USER=user
POSTGRES_PASSWORD=strong-production-password
POSTGRES_DB=db

# Примечание: Prisma может не видеть БД через postgres_db, используйте localhost
DATABASE_URL=postgresql://user:strong-production-password@localhost:5432/db

# JWT секрет (минимум 32 символа)
JWT_SECRET=very-long-random-secret-key-change-in-production

# Окружение
NODE_ENV=production

# Порт сервера
PORT=3000

# API URL для клиента
VITE_API_URL=http://localhost:3000
```

#### Для ручного запуска

```env
# projects/server/.env.production
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/db"
JWT_SECRET="your-production-secret"
PORT=3000
```

### 3. Запуск в продакшене

#### Вариант 1: Docker Compose (рекомендуется)

**Для разработки:**
```bash
# Запустить все сервисы в режиме разработки
docker compose up -d

# Проверить статус
docker compose ps

# Посмотреть логи
docker compose logs -f
```

**Для продакшена:**
```bash
# Создать файл .env с продакшн настройками
cp .env.example .env

# Отредактировать .env для продакшена
# NODE_ENV=production
# POSTGRES_PASSWORD=strong-production-password
# JWT_SECRET=very-long-random-secret-key

# Запустить все сервисы в продакшн режиме
docker compose -f docker-compose.prod.yml up -d

# Проверить статус
docker compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker compose -f docker-compose.prod.yml logs -f
```

#### Вариант 2: Ручной запуск

```bash
# Сборка проекта
pnpm build

# Запуск сервера
pnpm start

# Или напрямую Node.js
node projects/server/dist/main.js

# Клиент (статический build)
# Файлы уже готовы в projects/client/dist/
```

### 4. Проверка работоспособности

```bash
# Проверить PostgreSQL
docker exec -it postgres_db psql -U user -d db -c "SELECT version();"

# Проверить API сервер
curl http://localhost:3000/health

# Проверить React приложение
curl http://localhost:80

# Проверить Nginx
curl -I http://localhost:80
```

### 5. Мониторинг и логирование

```bash
# Посмотреть логи всех сервисов
docker compose logs

# Логи конкретного сервиса
docker compose logs server
docker compose logs postgres
docker compose logs nginx

# Логи в реальном времени
docker compose logs -f

# Статистика контейнеров
docker stats

# Проверить использование ресурсов
docker system df
```

## 📝 Настройка для нового проекта

### Обновление имен пакетов

```bash
# Измените в package.json файлах:
# Корень: "name": "your-project-name"
# Client: "name": "your-project-client"
# Server: "name": "your-project-server"
```

## 📊 Доступные скрипты

| Скрипт           | Описание                              |
| ---------------- | ------------------------------------- |
| `dev`            | Запуск клиента и сервера одновременно |
| `dev:client`     | Запуск только клиента                 |
| `dev:server`     | Запуск только сервера                 |
| `build`          | Сборка всех проектов                  |
| `start`          | Запуск сервера                        |
| `install:all`    | Установка всех зависимостей           |
| `install:client` | Установка зависимостей клиента        |
| `install:server` | Установка зависимостей сервера        |
| `install:clean`  | Полная очистка и переустановка        |

## 🤝 Лицензия

ISC
