import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProjectModule } from './project/project.module'
import { WidgetModule } from './widget/widget.module'
import { FilesModule } from './files/files.module'
import { CollectorModule } from './collector/collector.module'
import { StatsModule } from './stats/stats.module'
import { RequestModule } from './request/request.module'
import { LemnityModule } from './lemnity/lemnity.module'
import { MangoModule } from './mango/mango.module'
import { ManagerModule } from './manager/manager.module'
import { CallModule } from './call/call.module'
import { FeedbackModule } from './feedback/feedback.module'
import { ChatModule } from './chat/chat.module'
import { ChatOperatorModule } from './chat-operator/chat-operator.module'
import { ChatDepartmentModule } from './chat-department/chat-department.module'
import { ChatDistributionModule } from './chat-distribution/chat-distribution.module'
import { ChatSocialModule } from './chat-social/chat-social.module'
import { ChatGroupModule } from './chat-group/chat-group.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ProjectModule,
    WidgetModule,
    FilesModule,
    CollectorModule,
    StatsModule,
    RequestModule,
    LemnityModule,
    MangoModule,
    ManagerModule,
    CallModule,
    FeedbackModule,
    ChatModule,
    ChatOperatorModule,
    ChatDepartmentModule,
    ChatDistributionModule,
    ChatSocialModule,
    ChatGroupModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
