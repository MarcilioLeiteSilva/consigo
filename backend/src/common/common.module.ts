import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RedisService } from './redis.service';
import { BackupService } from './backup.service';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Global()
@Module({
  providers: [RedisService, BackupService],
  exports: [RedisService, BackupService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
