import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LayerMember } from 'src/homefeed/layer-member.entity';
export declare class LayerGuard implements CanActivate {
    private readonly layerMemberRepo;
    constructor(layerMemberRepo: Repository<LayerMember>);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
