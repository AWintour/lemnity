import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { ChatOperatorService } from '../chat-operator/chat-operator.service'

/**
 * Кто обращается к чату: владелец проекта (owner-JWT { id }) или оператор (operator-JWT
 * { sub, typ:'operator' }). Operator несёт scope (widgetId) и владельца (ownerUserId).
 */
export type ChatActor =
  | { kind: 'owner'; userId: string }
  | { kind: 'operator'; operatorId: string; ownerUserId: string; widgetId: string | null }

type ChatRequest = Request & { chatActor?: ChatActor }

/**
 * Guard чат-эндпоинтов: принимает owner-токен (как раньше) ИЛИ операторский токен и кладёт actor
 * в request. Операторский токен на прочих (owner) эндпоинтах не используется — изоляция.
 */
@Injectable()
export class ChatActorGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly operators: ChatOperatorService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<ChatRequest>()
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw new UnauthorizedException()

    const secret = this.config.get<string>('JWT_SECRET')
    let payload: { id?: string; sub?: string; typ?: string }
    try {
      payload = await this.jwt.verifyAsync(token, { secret })
    } catch {
      throw new UnauthorizedException()
    }

    if (payload.typ === 'operator' && payload.sub) {
      const op = await this.operators.getActiveActor(payload.sub)
      if (!op) throw new UnauthorizedException()
      req.chatActor = {
        kind: 'operator',
        operatorId: op.id,
        ownerUserId: op.ownerUserId,
        widgetId: op.widgetId
      }
      return true
    }

    if (payload.id) {
      req.chatActor = { kind: 'owner', userId: payload.id }
      return true
    }

    throw new UnauthorizedException()
  }
}

/** Параметр-декоратор: достаёт ChatActor, проставленный ChatActorGuard. */
export const ChatActorParam = createParamDecorator((_data: unknown, ctx: ExecutionContext): ChatActor => {
  return ctx.switchToHttp().getRequest<ChatRequest>().chatActor as ChatActor
})
