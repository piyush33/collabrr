import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: User;
        profileUser: import("../profileusers/profileuser.entity").ProfileUser;
    }>;
    signup(createUserDto: Partial<User>): Promise<User>;
    getProfile(req: any): any;
    googleAuth(token: string): Promise<{
        access_token: string;
        user: User;
        profileUser: import("../profileusers/profileuser.entity").ProfileUser;
    }>;
}
