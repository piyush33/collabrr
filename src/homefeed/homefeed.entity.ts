import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Comment } from '../comment/comment.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UserInteraction } from './user-interaction.entity';
import { Notification } from 'src/notification/notification.entity';

@Entity()
export class Homefeed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    picture: string;

    @Column({ nullable: true })
    text: string;

    @Column({ nullable: true })
    parent: string;

    @Column({ nullable: true })
    weblink: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Like, (like) => like.homefeedItem, { cascade: true })
    likes: Like[];

    @OneToMany(() => Repost, (repost) => repost.homefeedItem, { cascade: true })
    reposts: Repost[];

    @OneToMany(() => Save, (save) => save.homefeedItem, { cascade: true })
    saves: Save[];

    @OneToMany(() => Comment, (comment) => comment.homefeedItem, { cascade: true })
    comments: Comment[];

    @OneToMany(() => UserInteraction, (interaction) => interaction.homefeedItem, { cascade: true })
    interactions: UserInteraction[];

    @ManyToOne(() => ProfileUser, (user) => user.createdPosts)
    createdBy: ProfileUser;

    @OneToMany(() => Notification, (notification) => notification.homefeedItem)
    notifications: Notification[];
}
