import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOneByUsername(username: string): Promise<User | undefined>;
    findOneByEmail(email: string): Promise<User | undefined>;
    findOneByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
    create(user: User): Promise<User>;
}
