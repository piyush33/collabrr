// src/invitation/invitation.dtos.ts
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { OrgRole } from 'src/organization/organization-member.entity';

export class CreateOrgInviteDto {
  @IsEmail() email: string;
  @IsOptional() @IsEnum(OrgRole) role?: OrgRole; // default MEMBER
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  expiresInHours?: number; // default 168 (7 days)
}

export class CreateLayerInviteDto {
  @IsEmail() email: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  expiresInHours?: number; // default 168 (7 days)
}

export class AcceptInviteDto {
  @IsString() token: string;
}
