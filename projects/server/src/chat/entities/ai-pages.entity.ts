import { ApiProperty } from '@nestjs/swagger'

// Внутренняя страница сайта клиента, доступная для выбора в «Разделы для изучения».
export class AiPageEntity {
  @ApiProperty({ description: 'Абсолютный URL страницы' })
  url!: string

  @ApiProperty({ description: 'Путь страницы (для отображения), напр. /pricing' })
  path!: string
}

export class AiPagesResponse {
  @ApiProperty({ type: [AiPageEntity] })
  pages!: AiPageEntity[]
}
