import { Controller, Post, Body } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import type { User } from '@lemnity/database'

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Auth()
  @ApiResponse({ status: 201, description: 'Обращение принято и отправлено' })
  submit(
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: User
  ): Promise<{ ok: true }> {
    return this.feedbackService.submit(dto.text, user)
  }
}
