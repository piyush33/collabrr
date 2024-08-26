import { Test, TestingModule } from '@nestjs/testing';
import { ProfileFeedService } from './profilefeed.service';

describe('ProfilefeedService', () => {
  let service: ProfileFeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileFeedService],
    }).compile();

    service = module.get<ProfileFeedService>(ProfileFeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
