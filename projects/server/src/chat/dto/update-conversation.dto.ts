import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateConversationDto {
  @ApiPropertyOptional({ enum: ['open', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed'

  @ApiPropertyOptional({ description: 'Назначенный оператор (ChatOperator.id), null — снять назначение', nullable: true })
  @IsOptional()
  @IsString()
  assignedOperatorId?: string | null

  @ApiPropertyOptional({ description: 'Категория-статус беседы', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string | null

  @ApiPropertyOptional({ description: 'Внутренняя заметка оператора', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null

  @ApiPropertyOptional({ description: 'Канал: web|telegram|vk|max', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  channel?: string | null
}
