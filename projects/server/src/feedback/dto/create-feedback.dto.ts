import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, MaxLength } from 'class-validator'

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Текст идеи или замечания', maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string
}
