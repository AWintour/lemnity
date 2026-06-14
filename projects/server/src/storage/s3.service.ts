import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import type { S3ClientConfig, PutObjectCommandInput } from '@aws-sdk/client-s3'
import type { Readable } from 'stream'
import * as path from 'path'

export interface UploadResult {
  key: string
}

@Injectable()
export class S3Service {
  private readonly client: S3Client
  private readonly publicBaseUrl: string

  constructor() {
    const endpoint = process.env.S3_ENDPOINT
    const region = process.env.S3_REGION
    const accessKeyId = process.env.S3_ACCESS_KEY
    const secretAccessKey = process.env.S3_SECRET_KEY
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL

    if (!publicBaseUrl) {
      throw new Error('S3_PUBLIC_BASE_URL is not configured')
    }

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials are not configured')
    }
    if (!endpoint) {
      throw new Error('S3_ENDPOINT is not configured')
    }
    if (!region) {
      throw new Error('S3_REGION is not configured')
    }

    this.publicBaseUrl = publicBaseUrl.replace(/\/+$/, '')

    const clientConfig: S3ClientConfig = {
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true
    }

    this.client = new S3Client(clientConfig)
  }

  private buildKey(prefix: string | undefined, fileName: string): string {
    if (!prefix) return fileName
    return path.join(prefix, fileName).replace(/\\/g, '/')
  }

  async putObject(params: {
    bucket: string
    key: string
    prefix?: string
    body: Buffer
    contentType?: string
    cacheControl?: string
  }): Promise<UploadResult> {
    const { bucket, key, prefix, body, contentType, cacheControl } = params
    const fullKey = this.buildKey(prefix, key)

    const input: PutObjectCommandInput = {
      Bucket: bucket,
      Key: fullKey,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl
    }
    const command = new PutObjectCommand(input)
    await this.client.send(command)
    return { key: fullKey }
  }

  getPublicUrlForKey(key: string): string {
    return `${this.publicBaseUrl}/${key}`
  }

  // Чтение объекта (стрим) — для публичной отдачи файлов через бэкенд (не зависим от
  // анонимной политики бакета: используем те же креды, что и при загрузке).
  async getObject(
    bucket: string,
    key: string
  ): Promise<{ body: Readable; contentType?: string; contentLength?: number }> {
    const out = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    return {
      body: out.Body as Readable,
      contentType: out.ContentType,
      contentLength: out.ContentLength
    }
  }
}
