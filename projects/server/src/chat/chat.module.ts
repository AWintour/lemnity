import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '../prisma.service'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatController } from './chat.controller'
import { PublicChatController } from './public-chat.controller'
import { ChatActorGuard } from './chat-actor.guard'
import { ChatOperatorModule } from '../chat-operator/chat-operator.module'
import { S3Service } from '../storage/s3.service'

@Module({
  imports: [ConfigModule, JwtModule.register({}), ChatOperatorModule],
  controllers: [ChatController, PublicChatController],
  providers: [ChatService, ChatGateway, ChatActorGuard, PrismaService, S3Service]
})
export class ChatModule {}
