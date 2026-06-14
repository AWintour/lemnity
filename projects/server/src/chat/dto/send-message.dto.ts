import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class SendMessageDto {
  // Может быть пустым, если сообщение — только вложение.
  @ApiProperty()
  @IsString()
  @MaxLength(4000)
  body!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  attachmentUrl?: string

  @ApiProperty({ required: false, enum: ['image', 'video', 'file'] })
  @IsOptional()
  @IsIn(['image', 'video', 'file'])
  attachmentType?: 'image' | 'video' | 'file'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentName?: string
}
