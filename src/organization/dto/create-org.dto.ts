// src/organization/dto/create-org.dto.ts
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { JoinPolicy } from '../organization.entity';

export class CreateOrgDto {
  @IsString()
  @Length(2, 80)
  name: string;

  // lowercase, digits, hyphens only (like Slack)
  @IsString()
  @Length(2, 40)
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @IsOptional()
  @IsEnum(JoinPolicy)
  joinPolicy?: JoinPolicy;

  @IsOptional()
  @IsArray()
  allowedDomains?: string[]; // e.g. ['khidki.homes']
}
