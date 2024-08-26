import { Test, TestingModule } from '@nestjs/testing';
import { RepostController } from './repost.controller';

describe('RepostController', () => {
  let controller: RepostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepostController],
    }).compile();

    controller = module.get<RepostController>(RepostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
