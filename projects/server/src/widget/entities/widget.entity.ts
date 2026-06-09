import { ApiProperty } from '@nestjs/swagger'
import { WidgetType, Prisma } from '@lemnity/database'

export class Widget {
  @ApiProperty({
    description: 'The unique identifier of the widget',
    example: 'clxxx123456'
  })
  id: string

  @ApiProperty({
    description: 'The ID of the project this widget belongs to',
    example: 'clxxx789012'
  })
  projectId: string

  @ApiProperty({
    description: 'The name of the widget',
    example: 'My Wheel Widget'
  })
  name: string

  @ApiProperty({
    description: 'The type of the widget',
    enum: WidgetType,
    example: WidgetType.WHEEL_OF_FORTUNE
  })
  type: WidgetType

  @ApiProperty({
    description: 'Whether the widget is enabled',
    example: true
  })
  enabled: boolean

  @ApiProperty({
    description: 'JSON configuration for the widget',
    example: { colors: ['#FF0000', '#00FF00'], prizes: ['10% off', '20% off'] },
    required: false,
    nullable: true
  })
  config: Prisma.JsonValue

  @ApiProperty({
    description: 'Version of the widget configuration',
    example: 1,
    required: false,
    nullable: true
  })
  configVersion: number | null

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Active until (subscription/trial). Widget renders while paidUntil > now.',
    required: false,
    nullable: true
  })
  paidUntil: Date | null
}
