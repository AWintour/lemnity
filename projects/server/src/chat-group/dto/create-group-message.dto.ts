import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateGroupMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string

  @IsOptional()
  @IsString()
  operatorId?: string

  @IsOptional()
  @IsString()
  senderName?: string
}
