import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from 'src/config/jwt.config'
import { MailerModule } from '../mailer/mailer.module'
import { PasswordResetModule } from '../password-reset/password-reset.module'
import { PasswordResetController } from 'src/password-reset/password-reset.controller'
import { NotisendService } from 'src/mailer/notisend.service'
import { Logger } from '@nestjs/common'

@Module({
  imports: [
    UserModule,
    ConfigModule,
    MailerModule,
    PasswordResetModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig
    })
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [AuthService, JwtStrategy, NotisendService, Logger],
  exports: [AuthService]
})
export class AuthModule {}
