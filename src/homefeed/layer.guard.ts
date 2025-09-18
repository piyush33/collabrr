// layer.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LayerMember } from 'src/homefeed/layer-member.entity';

@Injectable()
export class LayerGuard implements CanActivate {
  constructor(
    @InjectRepository(LayerMember)
    private readonly layerMemberRepo: Repository<LayerMember>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const userId: number = req.user?.profileUserId ?? Number(req.query.userId); // replace with JWT user
    const layerId: number = Number(req.params.layerId ?? req.body.layerId);

    if (!userId || !layerId)
      throw new ForbiddenException('Missing identity or layerId');

    const lm = await this.layerMemberRepo.findOne({
      where: { layer: { id: layerId }, user: { id: userId } },
    });
    if (!lm) throw new ForbiddenException('Not a member of this layer');

    return true;
  }
}
