import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';

@Entity()
export class ProfileFeedItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
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

    @Column({ nullable: true })
    lock: boolean;

    @Column({ nullable: true })
    privacy: boolean;

    @ManyToOne(() => ProfileUser, (user) => user.created)
    userCreated: ProfileUser;

    @ManyToOne(() => ProfileUser, (user) => user.reposted)
    userReposted: ProfileUser;

    @ManyToOne(() => ProfileUser, (user) => user.liked)
    userLiked: ProfileUser;

    @ManyToOne(() => ProfileUser, (user) => user.saved)
    userSaved: ProfileUser;

    @OneToMany(() => Like, (like) => like.feedItem)
    likes: Like[];

    @OneToMany(() => Repost, (repost) => repost.feedItem)
    reposts: Repost[];

    @OneToMany(() => Save, (save) => save.feedItem)
    saves: Save[];
}
