import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProfileUser } from './profileuser.entity';
import { Organization } from 'src/organization/organization.entity';

@Entity()
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => ProfileUser, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  user: ProfileUser;

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;

  @Column()
  isFollowing: boolean;
}

@Entity()
export class Following {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => ProfileUser, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  user: ProfileUser;

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;
}
