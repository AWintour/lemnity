import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

const periods = ['7d', '30d', '90d', 'all'] as const
type PeriodKey = (typeof periods)[number]

// Звонки — это CALLBACK-заявки; статусы те же, но осмысленны processed/used/not_processed.
const statuses = ['new', 'processed', 'not_processed', 'used'] as const
type Status = (typeof statuses)[number]

export class ListCallsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string

  @ApiPropertyOptional({ enum: periods, default: '30d' })
  @IsOptional()
  @IsIn(periods)
  period?: PeriodKey

  @ApiPropertyOptional({ enum: statuses })
  @IsOptional()
  @IsIn(statuses)
  status?: Status

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  skip?: number

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number
}
