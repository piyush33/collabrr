import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity()
export class UserInteraction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProfileUser, (user) => user.interactions)
    user: ProfileUser;

    @ManyToOne(() => Homefeed, (homefeed) => homefeed.interactions)
    homefeedItem: Homefeed;

    @Column()
    interactionType: string; // 'like', 'repost', 'save', etc.
}
