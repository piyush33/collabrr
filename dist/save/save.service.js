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
exports.SaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const save_entity_1 = require("./save.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
let SaveService = class SaveService {
    constructor(saveRepository, userRepository, homefeedRepository) {
        this.saveRepository = saveRepository;
        this.userRepository = userRepository;
        this.homefeedRepository = homefeedRepository;
    }
    async saveItem(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        console.log('User found:', user);
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        console.log('Homefeed item found:', homefeedItem);
        const existingSave = await this.saveRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (existingSave) {
            console.log('User already saved this item');
            throw new common_1.ConflictException('User already saved this item');
        }
        const save = this.saveRepository.create({ user, homefeedItem });
        await this.saveRepository.save(save);
        console.log('Save saved:', save);
        user.saves.push(save);
        await this.userRepository.save(user);
        console.log('User updated with new save:', user);
        homefeedItem.saves.push(save);
        await this.homefeedRepository.save(homefeedItem);
        console.log('Homefeed item updated with new save:', homefeedItem);
        return user;
    }
    async hasSaved(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingSave = await this.saveRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        console.log('Existing save found:', existingSave);
        return !!existingSave;
    }
    async unSaveItem(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingSave = await this.saveRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingSave) {
            throw new common_1.NotFoundException('Save not found');
        }
        await this.saveRepository.remove(existingSave);
        user.saves = user.saves.filter(save => save.id !== existingSave.id);
        await this.userRepository.save(user);
        homefeedItem.saves = homefeedItem.saves.filter(save => save.id !== existingSave.id);
        await this.homefeedRepository.save(homefeedItem);
    }
};
exports.SaveService = SaveService;
exports.SaveService = SaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(save_entity_1.Save)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SaveService);
//# sourceMappingURL=save.service.js.map