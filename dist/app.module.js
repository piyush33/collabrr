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
const like_module_1 = require("./like/like.module");
const repost_module_1 = require("./repost/repost.module");
const save_module_1 = require("./save/save.module");
const comment_module_1 = require("./comment/comment.module");
const message_module_1 = require("./message/message.module");
const notification_module_1 = require("./notification/notification.module");
const s3_module_1 = require("./s3/s3.module");
const organization_module_1 = require("./organization/organization.module");
const invitation_module_1 = require("./invitation/invitation.module");
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
                    autoLoadEntities: true,
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
            organization_module_1.OrganizationModule,
            invitation_module_1.InvitationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map