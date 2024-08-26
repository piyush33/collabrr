"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const homefeed_module_1 = require("./homefeed/homefeed.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const profileusers_module_1 = require("./profileusers/profileusers.module");
const profilefeed_module_1 = require("./profilefeed/profilefeed.module");
const profileuser_entity_1 = require("./profileusers/profileuser.entity");
const profilefeed_item_entity_1 = require("./profilefeed/profilefeed-item.entity");
const homefeed_entity_1 = require("./homefeed/homefeed.entity");
const user_entity_1 = require("./users/user.entity");
const follower_entity_1 = require("./profileusers/follower.entity");
const like_module_1 = require("./like/like.module");
const repost_module_1 = require("./repost/repost.module");
const save_module_1 = require("./save/save.module");
const like_entity_1 = require("./like/like.entity");
const repost_entity_1 = require("./repost/repost.entity");
const save_entity_1 = require("./save/save.entity");
const reply_entity_1 = require("./comment/reply.entity");
const comment_entity_1 = require("./comment/comment.entity");
const comment_module_1 = require("./comment/comment.module");
const user_interaction_entity_1 = require("./homefeed/user-interaction.entity");
const message_module_1 = require("./message/message.module");
const message_entity_1 = require("./message/message.entity");
const conversation_entity_1 = require("./message/conversation.entity");
const notification_module_1 = require("./notification/notification.module");
const notification_entity_1 = require("./notification/notification.entity");
const s3_module_1 = require("./s3/s3.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME'),
                    entities: [profileuser_entity_1.ProfileUser, profilefeed_item_entity_1.ProfileFeedItem, homefeed_entity_1.Homefeed, user_entity_1.User, follower_entity_1.Follower, follower_entity_1.Following, like_entity_1.Like, repost_entity_1.Repost, save_entity_1.Save, comment_entity_1.Comment, reply_entity_1.Reply, user_interaction_entity_1.UserInteraction, message_entity_1.Message, conversation_entity_1.Conversation, notification_entity_1.Notification],
                    autoLoadEntities: false,
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            homefeed_module_1.HomefeedModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            profileusers_module_1.ProfileusersModule,
            profilefeed_module_1.ProfileFeedModule,
            like_module_1.LikeModule,
            repost_module_1.RepostModule,
            save_module_1.SaveModule,
            comment_module_1.CommentModule,
            message_module_1.MessageModule,
            notification_module_1.NotificationModule,
            s3_module_1.S3Module,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map