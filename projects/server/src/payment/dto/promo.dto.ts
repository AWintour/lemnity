import { ApiProperty } from '@nestjs/swagger'

export class PromoDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  promo: string

  @ApiProperty()
  discount: number
}
