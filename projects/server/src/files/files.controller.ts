import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { S3Service } from '../storage/s3.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import * as path from 'path'

const memoryStorage = multer.memoryStorage()
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB — больше нельзя (статус «Уменьшите размер файла»)
const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

// Файлы складываются в персональную «ячейку» пользователя: users/{userId}/...
@Auth()
@Controller('files')
export class FilesController {
  constructor(private readonly s3: S3Service) {}

  private sanitizeFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase()
    const base = path.basename(originalName, ext)
    const safeBase = base.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
    const safeExt = ext.replace(/[^a-z0-9.]/g, '')
    return `${safeBase}${safeExt}`
  }

  private isSvg(buffer: Buffer): boolean {
    const start = buffer.slice(0, 256).toString('utf8').trimStart()
    return start.startsWith('<svg')
  }

  private assertAllowedImage(file: Express.Multer.File): string {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException('Unsupported image type')
    }
    if (file.mimetype === 'image/svg+xml' && !this.isSvg(file.buffer)) {
      throw new BadRequestException('Invalid SVG content')
    }
    return file.mimetype
  }

  private buildImagesPrefix(userId: string): string {
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    return `users/${userId}/images/${yyyy}/${mm}`
  }

  private assertAllowedVideo(file: Express.Multer.File): string {
    const allowed = new Set(['video/mp4', 'video/webm'])
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException('Unsupported video type')
    }
    return file.mimetype
  }

  private buildVideosPrefix(userId: string): string {
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    return `users/${userId}/videos/${yyyy}/${mm}`
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage,
      limits: { fileSize: MAX_FILE_SIZE_BYTES }
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @Query('cache') cache?: string
  ) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    const bucket = process.env.S3_BUCKET_UPLOADS
    if (!bucket) {
      throw new BadRequestException('S3_BUCKET_UPLOADS is not configured on server')
    }
    const contentType = this.assertAllowedImage(file)
    const prefix = this.buildImagesPrefix(userId)
    const sanitized = this.sanitizeFileName(file.originalname)
    const key = `${randomUUID()}-${sanitized}`
    await this.s3.putObject({
      bucket,
      key,
      prefix,
      body: file.buffer,
      contentType,
      cacheControl: cache ?? 'public, max-age=31536000, immutable'
    })
    const fullKey = `${prefix}/${key}`
    const url = this.s3.getPublicUrlForKey(fullKey)
    return { key: fullKey, url }
  }

  @Post('videos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage,
      limits: { fileSize: MAX_VIDEO_SIZE_BYTES }
    })
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @Query('cache') cache?: string
  ) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    const bucket = process.env.S3_BUCKET_UPLOADS
    if (!bucket) {
      throw new BadRequestException('S3_BUCKET_UPLOADS is not configured on server')
    }
    const contentType = this.assertAllowedVideo(file)
    const prefix = this.buildVideosPrefix(userId)
    const sanitized = this.sanitizeFileName(file.originalname)
    const key = `${randomUUID()}-${sanitized}`
    await this.s3.putObject({
      bucket,
      key,
      prefix,
      body: file.buffer,
      contentType,
      cacheControl: cache ?? 'public, max-age=31536000, immutable'
    })
    const fullKey = `${prefix}/${key}`
    const url = this.s3.getPublicUrlForKey(fullKey)
    return { key: fullKey, url }
  }
}
