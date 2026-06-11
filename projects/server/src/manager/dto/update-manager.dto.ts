import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateManagerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @IsOptional()
  @IsIn(['SIP', 'Телефон'])
  type?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  address?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
