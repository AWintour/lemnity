import { Controller, Get, Req, Res } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { S3Service } from '../storage/s3.service'

// Публичная отдача загруженных файлов (аватары/лого/картинки шагов/вложения) через бэкенд.
// URL остаётся `https://<host>/uploads/<key>` (nginx проксирует сюда), поэтому ранее сохранённые
// ссылки продолжают работать. Бэкенд читает объект из MinIO теми же кредами, что и при загрузке —
// это не зависит от анонимной политики бакета (которая ненадёжно применяется).
@ApiExcludeController()
@Controller('public/uploads')
export class PublicUploadsController {
  constructor(private readonly s3: S3Service) {}

  @Get('*splat')
  async serve(@Req() req: Request, @Res() res: Response): Promise<void> {
    const bucket = process.env.S3_BUCKET_UPLOADS
    if (!bucket) {
      res.status(500).end()
      return
    }
    // Ключ объекта = путь после `/api/public/uploads/`. Берём из URL, чтобы не зависеть от
    // формы wildcard-параметра. Запрещаем выход за пределы префикса (`..`).
    const marker = '/public/uploads/'
    const pathOnly = (req.path ?? req.url ?? '').split('?')[0]
    const idx = pathOnly.indexOf(marker)
    const key = idx === -1 ? '' : decodeURIComponent(pathOnly.slice(idx + marker.length))
    if (!key || key.includes('..')) {
      res.status(400).end()
      return
    }
    try {
      const obj = await this.s3.getObject(bucket, key)
      res.setHeader('Content-Type', obj.contentType ?? 'application/octet-stream')
      if (obj.contentLength != null) res.setHeader('Content-Length', String(obj.contentLength))
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('Access-Control-Allow-Origin', '*')
      obj.body.on('error', () => res.destroy())
      obj.body.pipe(res)
    } catch {
      res.status(404).end()
    }
  }
}
