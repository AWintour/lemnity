import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateManagerDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsIn(['SIP', 'Телефон'])
  type!: string

  @IsString()
  @MinLength(1)
  address!: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
