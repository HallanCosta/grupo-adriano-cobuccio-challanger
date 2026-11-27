import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './appController.js';
import { AppService } from './appService.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API info', () => {
      expect(appController.getInfo()).toEqual({
        name: 'grupo-adriano-cobuccio-api',
        endpoints: ['GET /health', 'GET /metrics'],
      });
    });
  });
});
