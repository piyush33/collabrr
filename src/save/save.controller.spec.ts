import { Test, TestingModule } from '@nestjs/testing';
import { SaveController } from './save.controller';

describe('SaveController', () => {
  let controller: SaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaveController],
    }).compile();

    controller = module.get<SaveController>(SaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
