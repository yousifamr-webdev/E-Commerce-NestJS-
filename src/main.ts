import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT } from './config/config.service';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  const port = SERVER_PORT as string;

  await app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}
bootstrap();
