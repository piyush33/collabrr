import { Test, TestingModule } from '@nestjs/testing';
import { HomefeedController } from './homefeed.controller';

describe('HomefeedController', () => {
  let controller: HomefeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomefeedController],
    }).compile();

    controller = module.get<HomefeedController>(HomefeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
