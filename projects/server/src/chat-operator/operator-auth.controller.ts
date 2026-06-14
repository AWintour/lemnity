import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChatOperatorService } from './chat-operator.service'
import { OperatorLoginDto } from './dto/operator-login.dto'

/**
 * Изолированный вход оператора чата (email+пароль, заданные владельцем). Выдаёт операторский JWT
 * `{ sub: operatorId, typ: 'operator' }` (тот же JWT_SECRET). Аккаунт-владельца не создаёт.
 */
@Controller('auth/operator')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OperatorAuthController {
  constructor(
    private readonly operators: ChatOperatorService,
    private readonly jwt: JwtService
  ) {}

  @Post('login')
  async login(@Body() dto: OperatorLoginDto) {
    const op = await this.operators.verifyLogin(dto.email, dto.password)
    if (!op) throw new UnauthorizedException('Неверный логин или пароль')
    const accessToken = this.jwt.sign({ sub: op.id, typ: 'operator' }, { expiresIn: '12h' })
    return {
      accessToken,
      operator: { id: op.id, name: op.name, widgetId: op.widgetId }
    }
  }
}
