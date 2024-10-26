import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
    signup(createUserDto: Partial<User>): Promise<User>;
    getProfile(req: any): any;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
