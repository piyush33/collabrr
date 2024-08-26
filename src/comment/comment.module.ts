import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { Reply } from './reply.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Reply, Homefeed])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule { }
