import { Controller, Get, Param, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common'
import type { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { CallService } from './call.service'
import { ListCallsDto } from './dto/list-calls.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/**
 * Вкладка «Звонки»: список звонков (CALLBACK-заявки) + сводка по менеджерам + проигрывание записи.
 */
@ApiTags('calls')
@Controller('calls')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CallController {
  constructor(private readonly calls: CallService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Query() query: ListCallsDto) {
    return this.calls.list(userId, query)
  }

  @Get(':id/recording')
  @Auth()
  async recording(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const r = await this.calls.getRecording(userId, id)
    if (r.kind === 'redirect') {
      res.redirect(r.url)
      return
    }
    if (r.kind === 'stream') {
      res.setHeader('Content-Type', r.contentType)
      res.send(r.body)
      return
    }
    res.status(404).json({ message: 'Recording not available' })
  }
}
