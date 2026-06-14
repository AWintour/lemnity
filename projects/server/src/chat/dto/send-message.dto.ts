import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator'

export class MessageAttachmentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2048)
  url!: string

  @ApiProperty({ enum: ['image', 'video', 'file'] })
  @IsIn(['image', 'video', 'file'])
  type!: 'image' | 'video' | 'file'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string
}

export class SendMessageDto {
  // Может быть пустым, если сообщение — только вложение(я).
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

  // Мультивложения (оператор): до 10 в одном сообщении (галерея + файлы).
  @ApiProperty({ type: [MessageAttachmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[]
}
