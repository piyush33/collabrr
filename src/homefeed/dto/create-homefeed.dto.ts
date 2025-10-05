// src/homefeed/dto/create-homefeed.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Visibility } from '../homefeed.entity';
import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';

export class CreateHomefeedDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() picture?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() weblink?: string;
  @IsOptional() @IsString() category?: string;

  @IsOptional() @IsEnum(Visibility) visibility?: Visibility;

  // link the card to a layer by id or key
  @IsOptional() @IsNumber() layerId?: number;
  @IsOptional() @IsNumber() layerKey?: number;

  // TEAM visibility helpers
  @IsOptional() @IsNumber() teamId?: number;
  @IsOptional() allowedMemberIds?: number[];

  // locking
  @IsOptional() @IsBoolean() lock?: boolean; // when true and a layer exists, lock it
  @IsOptional()
  @IsEnum(Phase)
  phase?: Phase;

  @IsOptional()
  @IsArray()
  @IsEnum(RoleType, { each: true })
  roleTypes?: RoleType[];
}
