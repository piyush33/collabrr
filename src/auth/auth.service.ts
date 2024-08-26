import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsernameOrEmail(usernameOrEmail);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(userDto: Partial<User>): Promise<User> {
        const user = new User();
        user.name = userDto.name;
        user.username = userDto.username;
        user.email = userDto.email;
        user.password = await bcrypt.hash(userDto.password, 10);

        return this.usersService.create(user);
    }
}
