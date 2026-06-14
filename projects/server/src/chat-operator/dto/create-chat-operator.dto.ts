import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateChatOperatorDto {
  @IsString()
  @MinLength(1)
  name!: string

  // Учётка для входа оператора (email — логин, пароль хэшируется argon2).
  @IsOptional()
  @IsEmail()
  loginEmail?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  role?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsOptional()
  @IsString()
  departmentId?: string

  // Чат (CHAT-виджет), к которому ограничен оператор. null/отсутствует = все чаты владельца.
  @IsOptional()
  @IsString()
  widgetId?: string | null

  @IsOptional()
  @IsString()
  status?: string
}
