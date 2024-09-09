import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HomefeedModule } from "./homefeed/homefeed.module";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileusersModule } from './profileusers/profileusers.module';
import { ProfileFeedModule } from './profilefeed/profilefeed.module';
import { ProfileUser } from './profileusers/profileuser.entity';
import { ProfileFeedItem } from './profilefeed/profilefeed-item.entity';
import { Homefeed } from './homefeed/homefeed.entity';
import { User } from './users/user.entity';
import { Follower, Following } from './profileusers/follower.entity';
import { LikeModule } from './like/like.module';
import { RepostModule } from './repost/repost.module';
import { SaveModule } from './save/save.module';
import { Like } from './like/like.entity';
import { Repost } from './repost/repost.entity';
import { Save } from './save/save.entity';
import { Reply } from './comment/reply.entity';
import { Comment } from './comment/comment.entity';
import { CommentModule } from './comment/comment.module';
import { UserInteraction } from './homefeed/user-interaction.entity';
import { MessageModule } from './message/message.module';
import { Message } from './message/message.entity';
import { Conversation } from './message/conversation.entity';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/notification.entity';
import { S3Module } from './s3/s3.module';
import { ActorModule } from './actor/actor.module';
import { ActivityModule } from './activity/activity.module';
import { Activity } from './activity/activity.entity';
import { Actor } from './actor/actor.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigModule global, no need to import it in other modules
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [ProfileUser, ProfileFeedItem, Homefeed, User, Follower, Following, Like, Repost, Save, Comment, Reply, UserInteraction, Message, Conversation, Notification, Activity, Actor],
        autoLoadEntities: false,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    HomefeedModule,
    AuthModule,
    UsersModule,
    ProfileusersModule,
    ProfileFeedModule,
    LikeModule,
    RepostModule,
    SaveModule,
    CommentModule,
    MessageModule,
    NotificationModule,
    S3Module,
    ActorModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
