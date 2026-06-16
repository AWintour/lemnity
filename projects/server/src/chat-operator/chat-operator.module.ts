import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from '../config/jwt.config'
import { PrismaService } from '../prisma.service'
import { ChatOperatorService } from './chat-operator.service'
import { ChatOperatorController } from './chat-operator.controller'
import { OperatorAuthController } from './operator-auth.controller'
import { AuthModule } from '../auth/auth.module'
import { LemnityModule } from '../lemnity/lemnity.module'

/**
 * Операторы чата проекта (Chat Widget). CRUD в ЛК с проверкой владения проектом.
 * AuthModule — для @Auth() в контроллере; JwtModule — для выдачи операторского токена при входе.
 */
@Module({
  imports: [
    AuthModule,
    LemnityModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig
    })
  ],
  controllers: [ChatOperatorController, OperatorAuthController],
  providers: [ChatOperatorService, PrismaService],
  exports: [ChatOperatorService]
})
export class ChatOperatorModule {}
