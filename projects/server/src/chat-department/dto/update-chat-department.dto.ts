import { IsOptional, IsString } from 'class-validator'

export class UpdateChatDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string
}
