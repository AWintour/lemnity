import {
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Body,
  Res,
  Req,
  UnauthorizedException
} from '@nestjs/common'
import { AuthDto } from './dto/auth.dto'
import { AuthService } from './auth.service'
import type { Response, Request } from 'express'
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset.dto'
import { RegisterDto } from './dto/register.dto'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginResponse } from './entities/responses/login.entity'
import { RegisterResponse } from './entities/responses/register.entity'
import { Auth } from './decorators/auth.decorator'
import { CurrentUser } from './decorators/user.decorator'
import { User } from '../user/entities/user.entity'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @Auth()
  @ApiResponse({ status: 200, type: User })
  me(@CurrentUser() user: User): User {
    return user
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  @ApiResponse({ status: 403, description: 'invalid_credentials' })
  @ApiResponse({ status: 200, type: LoginResponse })
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    const { refreshToken, ...response } = await this.authService.login(dto)
    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return response
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  @ApiResponse({ status: 200, type: RegisterResponse })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<RegisterResponse> {
    const { refreshToken, ...response } = await this.authService.register(dto)
    this.authService.addRefreshTokenToResponse(res, refreshToken)

    await this.authService.sendWelcomeEmail(dto.email, dto.name, dto.password)

    return response
  }

  @HttpCode(200)
  @Post('logout')
  @ApiResponse({ status: 200, type: Boolean })
  logout(@Res({ passthrough: true }) res: Response): boolean {
    this.authService.removeRefreshTokenFromResponse(res)

    return true
  }

  /**
   * Сквозной выход из ЛК lemnity.ru: кабинет при логауте дёргает этот GET
   * (`<img>`/`fetch(no-cors, credentials:include)`) → чистим httpOnly refresh-cookie app.
   * GET без CORS-чтения ответа: refresh-cookie (sameSite:none) уходит кросс-доменно,
   * Set-Cookie на удаление применяется браузером. 204 → пустой ответ для beacon.
   */
  @HttpCode(204)
  @Get('sso-logout')
  ssoLogout(@Res({ passthrough: true }) res: Response): void {
    this.authService.removeRefreshTokenFromResponse(res)
  }

  @HttpCode(200)
  @Post('login/refresh')
  @ApiResponse({ status: 200, type: LoginResponse })
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    const cookies = req.cookies as Record<string, string | undefined>
    const refreshTokenFromCookies = cookies[this.authService.REFRESH_TOKEN_NAME]

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res)
      throw new UnauthorizedException('Refresh token not found in cookies')
    }

    const { refreshToken, ...response } =
      await this.authService.getNewTokens(refreshTokenFromCookies)

    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return response
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('forgot-password')
  @ApiResponse({ status: 200, type: Boolean })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<boolean> {
    await this.authService.issuePasswordReset(dto.email)
    return true
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('reset-password')
  @ApiResponse({ status: 200, type: Boolean })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<boolean> {
    await this.authService.resetPassword(dto.token, dto.newPassword)
    return true
  }
}
