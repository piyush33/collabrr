import { Team } from './team.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare enum TeamRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member"
}
export declare class TeamMember {
    id: number;
    team: Team;
    user: ProfileUser;
    role: TeamRole;
    isActive: boolean;
}
