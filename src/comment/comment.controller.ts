import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';
import { Comment } from './comment.entity';
import { Reply } from './reply.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':homefeedId')
  async addComment(
    @Param('homefeedId') homefeedId: number,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.addComment(homefeedId, createCommentDto);
  }

  @Post(':commentId/replies')
  async addReply(
    @Param('commentId') commentId: number,
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<Reply> {
    return this.commentService.addReply(commentId, createReplyDto);
  }

  @Get(':homefeedId')
  async getComments(
    @Param('homefeedId') homefeedId: number,
  ): Promise<Comment[]> {
    return this.commentService.getComments(homefeedId);
  }
}
