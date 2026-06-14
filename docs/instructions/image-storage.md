# Хранение картинок и файлов виджетов — правило по умолчанию

> Любые картинки/файлы виджета и кабинета грузятся в объектное хранилище (S3/MinIO) и хранятся
> как **URL**. **Никогда** не сохраняем `data:`-URL (base64) или `blob:`-URL в конфиг виджета или в БД.

## Почему

- base64 в `Widget.config` / полях БД раздувает конфиг (он отдаётся на КАЖДОЙ загрузке виджета) и
  упирается в лимиты тела запроса (был `413` при сохранении сценария/оператора).
- `blob:`-URL (`URL.createObjectURL`) вообще не персистентен — ломается после перезагрузки страницы.
- У каждого пользователя — **своя «ячейка»** в хранилище: файлы лежат под персональным префиксом,
  а не в общей плоской свалке.

## Клиент — как грузить

Используй `uploadImage` из `@/api/upload` (эталон: `components/settings/WidgetAppearanceSettings/CompanyLogo.tsx`):

```ts
import { uploadImage, MAX_IMAGE_BYTES, IMAGE_TOO_LARGE_MESSAGE } from '@/api/upload'

const onPick = (file: File) => {
  if (file.size > MAX_IMAGE_BYTES) { setError(IMAGE_TOO_LARGE_MESSAGE); return } // «Уменьшите размер файла (картинки)»
  setError('')
  uploadImage(file)
    .then(({ url }) => savePatch(url))           // в стор/конфиг идёт URL, не base64
    .catch(() => setError('Не удалось загрузить. ' + IMAGE_TOO_LARGE_MESSAGE))
}
```

- **Лимит 5 МБ** (`MAX_IMAGE_BYTES`, синхронно с сервером). Больше — статус «Уменьшите размер файла (картинки)».
- JWT в запрос подставляется http-интерсептором автоматически.

## Сервер — куда кладётся

`POST /api/files/images` (`projects/server/src/files/files.controller.ts`, `@Auth()`):
- ключ: `users/{userId}/images/{ГГГГ}/{ММ}/{uuid}-{имя}` — персональная «ячейка» пользователя;
- лимит `MAX_FILE_SIZE_BYTES = 5 МБ` (multer `limits.fileSize`); типы: jpeg/png/webp/svg;
- возвращает `{ key, url }`, где `url` — публичная ссылка (`S3_PUBLIC_BASE_URL + key`). Бакет `uploads`
  публичен на чтение (картинки виджета и так видны на сайте клиента); префикс — про владение, не секретность.

## Чек-лист при добавлении нового поля-картинки

1. Клиент: грузить через `uploadImage`, хранить URL; проверять `MAX_IMAGE_BYTES` + показывать статус.
2. Никаких `FileReader.readAsDataURL` / `URL.createObjectURL` для персистентных картинок.
3. Поле в схеме/типе — это `url: string` (ссылка), не data-URL.
