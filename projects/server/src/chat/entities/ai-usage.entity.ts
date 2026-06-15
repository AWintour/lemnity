import { ApiProperty } from '@nestjs/swagger'

// Статистика месячной квоты ИИ-агента по чат-виджету.
export class AiUsageEntity {
  @ApiProperty({ description: 'Задан ли ключ OpenRouter на сервере (иначе агент молчит)' })
  configured!: boolean

  @ApiProperty({ description: 'Лимит ответов ИИ в месяц на виджет' })
  limit!: number

  @ApiProperty({ description: 'Использовано в текущем календарном месяце' })
  used!: number

  @ApiProperty({ description: 'Осталось до лимита' })
  remaining!: number

  @ApiProperty({ description: 'ISO-дата сброса счётчика (начало след. месяца, UTC)' })
  resetAt!: string

  @ApiProperty({ description: 'Дневной лимит ответов ИИ (актуально для free-tier OpenRouter)' })
  dailyLimit!: number

  @ApiProperty({ description: 'Использовано сегодня (UTC)' })
  dailyUsed!: number

  @ApiProperty({ description: 'Осталось на сегодня' })
  dailyRemaining!: number

  @ApiProperty({ description: 'ISO-дата сброса дневного счётчика (начало след. суток, UTC)' })
  dailyResetAt!: string
}
