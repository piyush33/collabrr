import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { ProfileusersService } from 'src/profileusers/profileusers.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly profileusersService;
    constructor(usersService: UsersService, jwtService: JwtService, profileusersService: ProfileusersService);
    validateUser(usernameOrEmail: string, pass: string): Promise<any>;
    validateOAuthUser(profile: any): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(userDto: Partial<User>): Promise<User>;
}
