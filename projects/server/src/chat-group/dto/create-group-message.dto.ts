import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateGroupMessageDto {
  // Может быть пустым, если сообщение — только вложение.
  @IsString()
  @MaxLength(2000)
  body!: string

  @IsOptional()
  @IsString()
  operatorId?: string

  @IsOptional()
  @IsString()
  senderName?: string

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  attachmentUrl?: string

  @IsOptional()
  @IsIn(['image', 'video', 'file'])
  attachmentType?: 'image' | 'video' | 'file'

  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentName?: string
}
