import { IsArray, IsBoolean, IsIn, IsString } from 'class-validator'

export class SaveDistributionDto {
  @IsBoolean()
  enabled!: boolean

  @IsIn(['common', 'balanced'])
  method!: string

  @IsIn(['queue', 'load'])
  how!: string

  @IsArray()
  @IsString({ each: true })
  operatorIds!: string[]
}
