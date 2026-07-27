import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SecurityService } from 'src/common/module/security/security.service';
import { EmailService } from 'src/common/services/email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SecurityService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("auth")
  }
}
