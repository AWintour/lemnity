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

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsBoolean()
  online?: boolean
}
