import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { ProfileusersService } from 'src/profileusers/profileusers.service';
import { Repository } from 'typeorm';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly profileusersService;
    private readonly profileRepo;
    constructor(usersService: UsersService, jwtService: JwtService, profileusersService: ProfileusersService, profileRepo: Repository<ProfileUser>);
    private ensureProfileUser;
    private uniqueUsername;
    validateUser(usernameOrEmail: string, pass: string): Promise<any>;
    validateOAuthUser(profile: {
        email: string;
        firstName?: string;
        lastName?: string;
    }): Promise<User>;
    login(user: User): Promise<{
        access_token: string;
        user: User;
        profileUser: ProfileUser;
    }>;
    register(userDto: Partial<User>): Promise<User>;
}
