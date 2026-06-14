import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { S3Service } from '../storage/s3.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [FilesController],
  providers: [S3Service]
})
export class FilesModule {}
