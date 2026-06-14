import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateChatOperatorDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  // Учётка оператора: смена логина/пароля/активности.
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

  // Чат-скоуп оператора. null = все чаты владельца.
  @IsOptional()
  @IsString()
  widgetId?: string | null

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsBoolean()
  online?: boolean
}
