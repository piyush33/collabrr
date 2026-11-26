// src/leads/leads.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignPartnerRequest } from './design-partner-request.entity';
import { LeadsController } from './leads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DesignPartnerRequest])],
  controllers: [LeadsController],
})
export class LeadsModule {}
