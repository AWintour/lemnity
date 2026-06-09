import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { AuthDto } from './dto/auth.dto'
import { verify } from 'argon2'
import { Response } from 'express'
import { PasswordResetService } from '../password-reset/password-reset.service'
import { RegisterDto } from './dto/register.dto'
import { NotisendService } from 'src/mailer/notisend.service'
import { randomUUID } from 'node:crypto'

@Injectable()
export class AuthService {
  readonly EXPIRES_IN_REFRESH_TOKEN_DAYS = 1
  readonly REFRESH_TOKEN_NAME = 'refreshToken'

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private passwordResetService: PasswordResetService,
    private notisendService: NotisendService,
    private readonly logger: Logger
  ) {}

  async login(dto: AuthDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.validateUser(dto)
    const tokens = this.issueTokenPair(user.id)

    return {
      user,
      ...tokens
    }
  }

  async register(dto: RegisterDto) {
    const oldUser = await this.userService.getByEmail(dto.email)
    if (oldUser) {
      throw new BadRequestException('User already exists')
    }

    const user = await this.userService.create(dto)
    const publicUser = await this.userService.getPublicByIdOrThrow(user.id)
    const tokens = this.issueTokenPair(user.id)

    return {
      user: publicUser,
      ...tokens
    }
  }

  async sendWelcomeEmail(email: string, name: string, password: string) {
    try {
      await this.notisendService.sendEmailWithTemplate(
        email,
        '1752486', // ID шаблона notisend
        {
          username: name,
          email: email,
          password: password
        }
      )
    } catch (e) {
      this.logger.error(e)
    }
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync<{ id: string }>(refreshToken)
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.userService.getPublicByIdOrThrow(result.id)

    const tokens = this.issueTokenPair(user.id)

    return {
      user,
      ...tokens
    }
  }

  async issuePasswordReset(email: string) {
    await this.passwordResetService.request(email)
  }

  async resetPassword(rawToken: string, newPassword: string) {
    await this.passwordResetService.reset(rawToken, newPassword)
  }

  /**
   * SSO-вход из ЛК lemnity.ru по тикету (см. lemnity/lemnity.controller.ts): находим юзера
   * по email, иначе создаём (телефон+пароль обязательны+уникальны → ставим плейсхолдеры;
   * входа по паролю у такого юзера нет, только SSO). Возвращаем ту же пару токенов, что login.
   */
  async loginViaLemnity(input: { email: string; name?: string | null }) {
    let user = await this.userService.getByEmail(input.email)
    if (!user) {
      const dto: RegisterDto = {
        email: input.email,
        name: input.name || input.email.split('@')[0] || 'Lemnity',
        phone: `lemnity:${randomUUID()}`,
        password: `${randomUUID()}${randomUUID()}`
      } as RegisterDto
      user = await this.userService.create(dto)
    }
    const tokens = this.issueTokenPair(user.id)
    const publicUser = await this.userService.getPublicByIdOrThrow(user.id)
    return { user: publicUser, ...tokens }
  }

  private issueTokenPair(userId: string) {
    const data = { id: userId }
    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h'
    })
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const isValid = await verify(user.password, dto.password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  private getCookieDomain(): string | undefined {
    const url = process.env.FRONTEND_URL
    if (!url) return undefined
    try {
      return new URL(url).hostname
    } catch {
      return url.replace(/^https?:\/\//, '').split(':')[0]
    }
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRES_IN_REFRESH_TOKEN_DAYS)
    const isProd = process.env.NODE_ENV === 'production'

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: isProd ? this.getCookieDomain() : undefined,
      expires: expiresIn,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    })
  }

  removeRefreshTokenFromResponse(res: Response) {
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: isProd ? this.getCookieDomain() : undefined,
      expires: new Date(0),
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    })
  }
}
