import { IsBoolean, IsObject, IsOptional } from 'class-validator'

export class UpdateIntegrationDto {
  @IsBoolean()
  connected!: boolean

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>
}
