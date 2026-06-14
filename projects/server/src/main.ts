import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { NextFunction, Request, Response } from 'express'

type CorsOptions = {
  origin?: string | boolean
  credentials?: boolean
  exposedHeaders?: string[]
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

async function bootstrap() {
  // rawBody: true — нужен сырой body для проверки HMAC-подписи вебхука /api/lemnity/widget-subscription
  // (подпись считается по точным байтам тела, ре-сериализация JSON может не совпасть).
  const app = await NestFactory.create(AppModule, { rawBody: true })

  // Конфиг виджета может содержать data-URL картинки (картинки шагов сценария, аватары операторов),
  // дефолтный лимит body-parser 100kb → 413. Поднимаем до 25mb (в пределах nginx client_max_body_size 25M).
  // useBodyParser на уровне app сам прокидывает rawBody:true → сырой body для HMAC-вебхука сохраняется.
  const expressApp = app as unknown as NestExpressApplication
  expressApp.useBodyParser('json', { limit: '25mb' })
  expressApp.useBodyParser('urlencoded', { limit: '25mb', extended: true })

  const config = new DocumentBuilder()
    .setTitle('Lemnity API')
    .setDescription('The Lemnity API description')
    .setVersion('1.0')
    .addTag('lemnity')
    .addServer(process.env.API_URL || '/api')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, documentFactory)

  app.setGlobalPrefix('api')
  app.use(cookieParser())

  const isProd = process.env.NODE_ENV === 'production'
  const explicitFrontendOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const isAllowedDevOrigin = (origin: string) => {
    try {
      const url = new URL(origin)
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    } catch {
      return false
    }
  }

  app.enableCors((req: Request, callback: (err: Error | null, options?: CorsOptions) => void) => {
    const path = req.originalUrl ?? req.url ?? ''
    if (path.startsWith('/api/public')) {
      callback(null, {
        origin: '*',
        credentials: false,
        preflightContinue: false,
        optionsSuccessStatus: 204
      })
      return
    }

    const origin = req.header('Origin')
    const allow =
      !origin || explicitFrontendOrigins.includes(origin) || (!isProd && isAllowedDevOrigin(origin))

    callback(null, {
      origin: allow ? (origin ?? true) : false,
      credentials: true,
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    })
  })
  app.use('/api/public', (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.header('Access-Control-Allow-Credentials', 'false')
    if (req.method === 'OPTIONS') {
      res.sendStatus(204)
      return
    }
    next()
  })

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap().catch(error => {
  console.error('Failed to bootstrap app', error)
  process.exit(1)
})
