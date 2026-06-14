import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateChatOperatorDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

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
