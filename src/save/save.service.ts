import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Save } from './save.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Injectable()
export class SaveService {
    constructor(
        @InjectRepository(Save)
        private saveRepository: Repository<Save>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
    ) { }

    async saveItem(username: string, homefeedItemId: number): Promise<ProfileUser> {

        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }
        console.log('User found:', user);

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
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
            throw new ConflictException('User already saved this item');
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

    async hasSaved(username: string, homefeedItemId: number): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
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

    async unSaveItem(username: string, homefeedItemId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['saves'] });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['saves'] });
        if (!homefeedItem) {
            throw new NotFoundException('Feed item not found');
        }

        const existingSave = await this.saveRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingSave) {
            throw new NotFoundException('Save not found');
        }

        await this.saveRepository.remove(existingSave);

        // Remove the save from the user's save array
        user.saves = user.saves.filter(save => save.id !== existingSave.id);
        await this.userRepository.save(user);

        // Remove the save from the homefeed item's save array
        homefeedItem.saves = homefeedItem.saves.filter(save => save.id !== existingSave.id);
        await this.homefeedRepository.save(homefeedItem);
    }
}
