import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator'

/** ЛК: сохранение BYO-интеграции Mango для проекта. Секреты пишутся только при передаче. */
export class SaveMangoIntegrationDto {
  @IsOptional()
  @IsString()
  apiKey?: string

  @IsOptional()
  @IsString()
  apiSalt?: string

  @IsOptional()
  @IsString()
  managerType?: string

  @IsOptional()
  @IsString()
  managerAddress?: string

  @IsOptional()
  @IsString()
  lineNumber?: string

  @IsOptional()
  @IsString()
  callMode?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  delaySeconds?: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
