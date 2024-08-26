import { Test, TestingModule } from '@nestjs/testing';
import { ProfileFeedController } from './profilefeed.controller';

describe('ProfileFeedController', () => {
  let controller: ProfileFeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileFeedController],
    }).compile();

    controller = module.get<ProfileFeedController>(ProfileFeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
