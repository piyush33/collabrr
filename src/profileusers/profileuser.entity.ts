import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Follower, Following } from './follower.entity';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { UserInteraction } from 'src/homefeed/user-interaction.entity';
import { Conversation } from 'src/message/conversation.entity';
import { Message } from 'src/message/message.entity';
import { Notification } from 'src/notification/notification.entity';

@Entity()
export class ProfileUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    tagline: string;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    image: string;

    @OneToMany(() => Message, (message) => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Conversation, (conversation) => conversation.user1)
    conversationsAsUser1: Conversation[];

    @OneToMany(() => Conversation, (conversation) => conversation.user2)
    conversationsAsUser2: Conversation[];

    @OneToMany(() => Follower, (follower) => follower.user, { cascade: true })
    followers: Follower[];

    @OneToMany(() => Following, (following) => following.user, { cascade: true })
    following: Following[];

    @OneToMany(() => Homefeed, (item) => item.createdBy, { cascade: true })
    createdPosts: Homefeed[];

    @OneToMany(() => ProfileFeedItem, (item) => item.userCreated, { cascade: true })
    created: ProfileFeedItem[];

    @OneToMany(() => ProfileFeedItem, (item) => item.userReposted)
    reposted: ProfileFeedItem[];

    @OneToMany(() => ProfileFeedItem, (item) => item.userLiked)
    liked: ProfileFeedItem[];

    @OneToMany(() => ProfileFeedItem, (item) => item.userSaved)
    saved: ProfileFeedItem[];

    @OneToMany(() => Like, (like) => like.user, { cascade: true })
    likes: Like[];

    @OneToMany(() => Repost, (repost) => repost.user, { cascade: true })
    reposts: Repost[];

    @OneToMany(() => Save, (save) => save.user, { cascade: true })
    saves: Save[];

    @OneToMany(() => UserInteraction, (interaction) => interaction.user, { cascade: true })
    interactions: UserInteraction[];

    @OneToMany(() => Notification, (notification) => notification.targetUser)
    notificationsReceived: Notification[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}
