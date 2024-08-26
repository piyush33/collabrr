import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string; // "liked" or "reposted"

    @ManyToOne(() => ProfileUser, (user) => user.notifications, { onDelete: 'CASCADE' })
    user: ProfileUser; // The user who performed the action (liked or reposted)

    @ManyToOne(() => Homefeed, (item) => item.notifications, { onDelete: 'CASCADE' })
    homefeedItem: Homefeed; // The item that was liked or reposted

    @ManyToOne(() => ProfileUser, (user) => user.notificationsReceived, { onDelete: 'CASCADE' })
    targetUser: ProfileUser; // The main user who receives the notification

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
