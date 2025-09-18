"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
const profileusers_service_1 = require("../profileusers/profileusers.service");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
let AuthService = class AuthService {
    constructor(usersService, jwtService, profileusersService, profileRepo) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.profileusersService = profileusersService;
        this.profileRepo = profileRepo;
    }
    async ensureProfileUser(name, username, email) {
        let profile = await this.profileRepo.findOne({ where: { username } });
        if (!profile) {
            profile = await this.profileusersService.create({
                name: name ?? username,
                username,
            });
        }
        return profile;
    }
    async uniqueUsername(base) {
        let candidate = base.toLowerCase();
        let i = 0;
        while (await this.usersService.findOneByUsername(candidate)) {
            i += 1;
            candidate = `${base.toLowerCase()}${i}`;
        }
        return candidate;
    }
    async validateUser(usernameOrEmail, pass) {
        const user = await this.usersService.findOneByUsernameOrEmail(usernameOrEmail);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async validateOAuthUser(profile) {
        let user = await this.usersService.findOneByEmail(profile.email);
        if (!user) {
            const base = profile.email.split('@')[0];
            const username = await this.uniqueUsername(base);
            const newUser = new user_entity_1.User();
            newUser.email = profile.email;
            newUser.name =
                [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
                    username;
            newUser.username = username;
            user = await this.usersService.create(newUser);
        }
        await this.ensureProfileUser(user.name, user.username, user.email);
        return user;
    }
    async login(user) {
        const profile = await this.profileRepo.findOne({
            where: { username: user.username },
        });
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            profileUserId: profile?.id,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user,
            profileUser: profile ?? null,
        };
    }
    async register(userDto) {
        if (await this.usersService.findOneByEmail(userDto.email)) {
            throw new common_1.ConflictException('Email already in use');
        }
        if (await this.usersService.findOneByUsername(userDto.username)) {
            throw new common_1.ConflictException('Username already in use');
        }
        const user = new user_entity_1.User();
        user.name = userDto.name;
        user.username = userDto.username;
        user.email = userDto.email;
        user.password = await bcrypt.hash(userDto.password, 10);
        const created = await this.usersService.create(user);
        await this.ensureProfileUser(created.name, created.username, created.email);
        return created;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_2.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        profileusers_service_1.ProfileusersService,
        typeorm_1.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map