import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

/** Подписка персонала на web-push: проект + PushSubscription (endpoint + ключи). */
export class PushSubscribeDto {
  @IsString()
  @MinLength(1)
  projectId!: string

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  endpoint!: string

  @IsString()
  @MinLength(1)
  p256dh!: string

  @IsString()
  @MinLength(1)
  auth!: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string
}

/** Отписка: достаточно endpoint. */
export class PushUnsubscribeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  endpoint!: string
}
