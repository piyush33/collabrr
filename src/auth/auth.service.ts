// src/auth/auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { ProfileusersService } from 'src/profileusers/profileusers.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly profileusersService: ProfileusersService,
    @InjectRepository(ProfileUser)
    private readonly profileRepo: Repository<ProfileUser>,
  ) {}

  // ----- helpers -----
  private async ensureProfileUser(
    name: string | undefined,
    username: string,
    email?: string,
  ) {
    let profile = await this.profileRepo.findOne({ where: { username } });
    if (!profile) {
      profile = await this.profileusersService.create({
        name: name ?? username,
        username,
        // (optional) add email to ProfileUser if your entity has it; shown only if field exists
        // email,
      });
    }
    return profile;
  }

  private async uniqueUsername(base: string) {
    let candidate = base.toLowerCase();
    let i = 0;
    while (await this.usersService.findOneByUsername(candidate)) {
      i += 1;
      candidate = `${base.toLowerCase()}${i}`;
    }
    return candidate;
  }

  // ----- local auth -----
  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    const user =
      await this.usersService.findOneByUsernameOrEmail(usernameOrEmail);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // For Google OAuth
  async validateOAuthUser(profile: {
    email: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    let user = await this.usersService.findOneByEmail(profile.email);
    if (!user) {
      const base = profile.email.split('@')[0];
      const username = await this.uniqueUsername(base);
      const newUser = new User();
      newUser.email = profile.email;
      newUser.name =
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
        username;
      newUser.username = username;
      // password stays null/undefined for OAuth accounts
      user = await this.usersService.create(newUser);
    }

    // Ensure profile user exists (idempotent)
    await this.ensureProfileUser(user.name, user.username, user.email);
    return user;
  }

  // Return richer payload & response (includes profileUserId)
  async login(user: User) {
    const profile = await this.profileRepo.findOne({
      where: { username: user.username },
    });
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      profileUserId: profile?.id, // <— key for org-aware routes
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
      profileUser: profile ?? null,
    };
  }

  // Register with email/password
  // Returns created user (keep behavior compatible with your current FE flow)
  async register(userDto: Partial<User>): Promise<User> {
    // enforce unique username & email
    if (await this.usersService.findOneByEmail(userDto.email)) {
      throw new ConflictException('Email already in use');
    }
    if (await this.usersService.findOneByUsername(userDto.username)) {
      throw new ConflictException('Username already in use');
    }

    const user = new User();
    user.name = userDto.name;
    user.username = userDto.username;
    user.email = userDto.email;
    user.password = await bcrypt.hash(userDto.password, 10);

    const created = await this.usersService.create(user);

    // Ensure ProfileUser exists
    await this.ensureProfileUser(created.name, created.username, created.email);

    return created;
  }
}
