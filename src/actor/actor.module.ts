import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './actor.entity';
import { ActorService } from './actor.service';
import { ActorController } from './actor.controller';
import { InboxController } from './inbox.controller';
import { ActivityService } from 'src/activity/activity.service';
import { Activity } from 'src/activity/activity.entity';
import { SignatureValidationMiddleware } from './signature-validation.middleware';
import { WebFingerController } from './webfinger.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Actor, Activity])],
  controllers: [ActorController, InboxController, WebFingerController],
  providers: [ActorService, ActivityService],
  exports: [ActorService],
})
export class ActorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the SignatureValidationMiddleware only to the inbox POST route
    consumer
      .apply(SignatureValidationMiddleware)
      .forRoutes({ path: 'actors/:actorId/inbox', method: RequestMethod.POST });
  }
}
