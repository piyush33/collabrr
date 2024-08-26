import { Test, TestingModule } from '@nestjs/testing';
import { ProfileusersService } from './profileusers.service';

describe('ProfileusersService', () => {
  let service: ProfileusersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileusersService],
    }).compile();

    service = module.get<ProfileusersService>(ProfileusersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
