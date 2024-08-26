"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const profileuser_entity_1 = require("./profileusers/profileuser.entity");
const profilefeed_item_entity_1 = require("./profilefeed/profilefeed-item.entity");
const like_entity_1 = require("./like/like.entity");
const repost_entity_1 = require("./repost/repost.entity");
const save_entity_1 = require("./save/save.entity");
const homefeed_entity_1 = require("./homefeed/homefeed.entity");
const follower_entity_1 = require("./profileusers/follower.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "mydatabase",
    entities: [profileuser_entity_1.ProfileUser, profilefeed_item_entity_1.ProfileFeedItem, like_entity_1.Like, repost_entity_1.Repost, save_entity_1.Save, homefeed_entity_1.Homefeed, follower_entity_1.Follower, follower_entity_1.Following],
    migrations: ['src/migration/*.ts'],
    synchronize: true,
});
//# sourceMappingURL=data-source.js.map