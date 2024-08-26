import { Test, TestingModule } from '@nestjs/testing';
import { ProfileusersController } from './profileusers.controller';

describe('ProfileusersController', () => {
  let controller: ProfileusersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileusersController],
    }).compile();

    controller = module.get<ProfileusersController>(ProfileusersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
