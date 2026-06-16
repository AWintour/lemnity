import { ApiProperty } from '@nestjs/swagger'
import type { ChatPlanTier } from '../../lemnity/chat-entitlement'

// Набор фич тарифа Чата (по рангу тарифной лестницы).
export class ChatPlanFeaturesEntity {
  @ApiProperty({ description: 'Все каналы (соцсети/мессенджеры)' })
  allChannels!: boolean

  @ApiProperty({ description: 'White label (без брендинга Lemnity)' })
  whiteLabel!: boolean

  @ApiProperty({ description: 'Расширенная аналитика' })
  advancedAnalytics!: boolean

  @ApiProperty({ description: 'Отделы (departments)' })
  departments!: boolean

  @ApiProperty({ description: 'Доступ к API' })
  apiAccess!: boolean

  @ApiProperty({ description: 'Приоритетная поддержка' })
  prioritySupport!: boolean
}

// Подписка (entitlement) аккаунта-владельца чат-виджета — для раздела тарифов в редакторе.
export class ChatSubscriptionEntity {
  @ApiProperty({ description: 'Тариф: free|start|pro|business|agency' })
  planTier!: ChatPlanTier

  @ApiProperty({ description: 'Лимит операторов (менеджеров) аккаунта' })
  managerLimit!: number

  @ApiProperty({ description: 'Лимит сайтов (чат-виджетов)' })
  siteLimit!: number

  @ApiProperty({ description: 'Дневной лимит ответов ИИ' })
  aiDailyLimit!: number

  @ApiProperty({ description: 'До какого момента оплачено (ISO), null = бессрочный free', nullable: true })
  paidUntil!: string | null

  @ApiProperty({ description: 'Доступность фич по тарифу', type: ChatPlanFeaturesEntity })
  features!: ChatPlanFeaturesEntity
}
