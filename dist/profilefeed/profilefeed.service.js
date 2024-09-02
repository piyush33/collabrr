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
exports.ProfileFeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profilefeed_item_entity_1 = require("./profilefeed-item.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
let ProfileFeedService = class ProfileFeedService {
    constructor(profileFeedRepository, userRepository) {
        this.profileFeedRepository = profileFeedRepository;
        this.userRepository = userRepository;
    }
    findAll() {
        return this.profileFeedRepository.find();
    }
    findOne(id) {
        return this.profileFeedRepository.findOne({ where: { id } });
    }
    async findAllByFeedType(username, feedType) {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });
        if (!user) {
            throw new common_1.NotFoundException('ProfileUser not found');
        }
        return user[feedType].map(item => this.toDto(item));
    }
    async create(username, createFeedItemDto, feedType) {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });
        if (!user) {
            throw new common_1.NotFoundException('ProfileUser not found');
        }
        const feedItem = this.profileFeedRepository.create(createFeedItemDto);
        feedItem.username = createFeedItemDto.username ? createFeedItemDto.username : username;
        console.log("feedItem:", feedItem);
        feedItem[`user${feedType.charAt(0).toUpperCase() + feedType.slice(1)}`] = user;
        if (!user[feedType]) {
            user[feedType] = [];
        }
        user[feedType].push(feedItem);
        await this.userRepository.save(user);
        const savedFeedItem = await this.profileFeedRepository.save(feedItem);
        return this.toDto(savedFeedItem);
    }
    async update(id, updateFeedItemDto) {
        const feedItem = await this.findOne(id);
        Object.assign(feedItem, updateFeedItemDto);
        const updatedFeedItem = await this.profileFeedRepository.save(feedItem);
        return this.toDto(updatedFeedItem);
    }
    async delete(username, id, feedType) {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });
        if (!user) {
            throw new common_1.NotFoundException('ProfileUser not found');
        }
        user[feedType] = user[feedType].filter(item => item.id !== id);
        await this.userRepository.save(user);
        await this.profileFeedRepository.delete(id);
    }
    toDto(feedItem) {
        return {
            id: feedItem.id,
            username: feedItem.username,
            title: feedItem.title,
            description: feedItem.description,
            image: feedItem.image,
            picture: feedItem.picture,
            text: feedItem.text,
            parent: feedItem.parent,
            lock: feedItem.lock,
            privacy: feedItem.privacy,
        };
    }
};
exports.ProfileFeedService = ProfileFeedService;
exports.ProfileFeedService = ProfileFeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profilefeed_item_entity_1.ProfileFeedItem)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProfileFeedService);
//# sourceMappingURL=profilefeed.service.js.map