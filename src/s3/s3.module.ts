import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { UploadController } from './s3.controller';

@Module({
  providers: [S3Service],
  controllers: [UploadController]
})
export class S3Module { }
