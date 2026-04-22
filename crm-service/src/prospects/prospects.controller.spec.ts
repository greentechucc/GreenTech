import { Test, TestingModule } from '@nestjs/testing';
import { ProspectsController } from './prospects.controller';

describe('ProspectsController', () => {
  let controller: ProspectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProspectsController],
    }).compile();

    controller = module.get<ProspectsController>(ProspectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
