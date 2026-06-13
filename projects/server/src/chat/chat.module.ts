import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '../prisma.service'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatController } from './chat.controller'
import { PublicChatController } from './public-chat.controller'

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [ChatController, PublicChatController],
  providers: [ChatService, ChatGateway, PrismaService]
})
export class ChatModule {}
