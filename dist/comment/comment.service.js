"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./comment.entity");
const reply_entity_1 = require("./reply.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
let CommentService = class CommentService {
    constructor(commentRepository, replyRepository, homefeedRepository) {
        this.commentRepository = commentRepository;
        this.replyRepository = replyRepository;
        this.homefeedRepository = homefeedRepository;
    }
    async addComment(homefeedId, createCommentDto) {
        const homefeed = await this.homefeedRepository.findOne({ where: { id: homefeedId } });
        if (!homefeed) {
            throw new common_1.NotFoundException('Homefeed item not found');
        }
        const comment = this.commentRepository.create(createCommentDto);
        comment.homefeedItem = homefeed;
        return this.commentRepository.save(comment);
    }
    async addReply(commentId, createReplyDto) {
        const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ['replies'] });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        const reply = this.replyRepository.create(createReplyDto);
        reply.comment = comment;
        return this.replyRepository.save(reply);
    }
    async getComments(homefeedId) {
        const homefeed = await this.homefeedRepository.findOne({ where: { id: homefeedId }, relations: ['comments', 'comments.replies'] });
        if (!homefeed) {
            throw new common_1.NotFoundException('Homefeed item not found');
        }
        return homefeed.comments;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(reply_entity_1.Reply)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommentService);
//# sourceMappingURL=comment.service.js.map