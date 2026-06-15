import { IsOptional, IsString, MinLength } from 'class-validator'

/** Креды подключения соцсети. token: бот (TG/MAX) или токен сообщества (VK). groupId — только VK (опц., автоопределяется). */
export class ConnectIntegrationDto {
  @IsString()
  @MinLength(1)
  token!: string

  @IsOptional()
  @IsString()
  groupId?: string
}
