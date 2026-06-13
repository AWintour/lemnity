import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ListConversationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string

  @ApiPropertyOptional({ enum: ['open', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed'

  @ApiPropertyOptional({ enum: ['7d', '30d', '90d', 'all'] })
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'all'])
  period?: '7d' | '30d' | '90d' | 'all'

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number
}
