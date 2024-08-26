import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Reply } from './reply.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Reply)
        private replyRepository: Repository<Reply>,
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
    ) { }

    async addComment(homefeedId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
        const homefeed = await this.homefeedRepository.findOne({ where: { id: homefeedId } });
        if (!homefeed) {
            throw new NotFoundException('Homefeed item not found');
        }

        const comment = this.commentRepository.create(createCommentDto);
        comment.homefeedItem = homefeed;

        return this.commentRepository.save(comment);
    }

    async addReply(commentId: number, createReplyDto: CreateReplyDto): Promise<Reply> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ['replies'] });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const reply = this.replyRepository.create(createReplyDto);
        reply.comment = comment;

        return this.replyRepository.save(reply);
    }

    async getComments(homefeedId: number): Promise<Comment[]> {
        const homefeed = await this.homefeedRepository.findOne({ where: { id: homefeedId }, relations: ['comments', 'comments.replies'] });
        if (!homefeed) {
            throw new NotFoundException('Homefeed item not found');
        }

        return homefeed.comments;
    }
}
