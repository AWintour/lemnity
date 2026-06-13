import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreatePublicConversationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  widgetId!: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  sessionId!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  visitorPhone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorEmail?: string
}
