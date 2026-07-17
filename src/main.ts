import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = SERVER_PORT as string;

  await app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}
bootstrap();
