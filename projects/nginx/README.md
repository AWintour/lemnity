# Nginx Configuration

Конфигурация Nginx для reverse proxy и раздачи статики.

## 📁 Структура

- `nginx.conf` - основная конфигурация
- `ssl/` - папка для SSL сертификатов
- `.dockerignore` - исключения для Docker

## 🔧 Настройка

### SSL сертификаты
Поместите SSL сертификаты в папку `ssl/`:
- `ssl/cert.pem` - сертификат
- `ssl/key.pem` - приватный ключ

### Конфигурация
Основная конфигурация в `nginx.conf`:
- Reverse proxy для API
- Раздача статики клиента
- Gzip сжатие
- Кэширование

## 🐳 Docker

Контейнер автоматически монтирует:
- `./nginx.conf` → `/etc/nginx/nginx.conf`
- `./ssl/` → `/etc/nginx/ssl/`
- `client_static` volume → `/usr/share/nginx/html`
