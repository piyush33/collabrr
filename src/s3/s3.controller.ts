import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('feed-item')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFeedItemImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.s3Service.uploadFile(file, 'feed-items');
    return { imageUrl };
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.s3Service.uploadFile(file, 'profile-images');
    return { imageUrl };
  }
}
