import { Test, TestingModule } from '@nestjs/testing';
import { HomefeedService } from './homefeed.service';

describe('HomefeedService', () => {
  let service: HomefeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomefeedService],
    }).compile();

    service = module.get<HomefeedService>(HomefeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
