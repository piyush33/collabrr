import { CommentService } from './comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';
import { Comment } from './comment.entity';
import { Reply } from './reply.entity';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    addComment(homefeedId: number, createCommentDto: CreateCommentDto): Promise<Comment>;
    addReply(commentId: number, createReplyDto: CreateReplyDto): Promise<Reply>;
    getComments(homefeedId: number): Promise<Comment[]>;
}
