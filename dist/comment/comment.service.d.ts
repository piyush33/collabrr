import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Reply } from './reply.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';
export declare class CommentService {
    private commentRepository;
    private replyRepository;
    private homefeedRepository;
    constructor(commentRepository: Repository<Comment>, replyRepository: Repository<Reply>, homefeedRepository: Repository<Homefeed>);
    addComment(homefeedId: number, createCommentDto: CreateCommentDto): Promise<Comment>;
    addReply(commentId: number, createReplyDto: CreateReplyDto): Promise<Reply>;
    getComments(homefeedId: number): Promise<Comment[]>;
}
