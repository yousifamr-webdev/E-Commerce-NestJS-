import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/user.controller';
import { User } from 'src/Models/User.model';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from './common/module/shared.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/subcategory/subcategory.module';
import { BrandModule } from './modules/brand/brand.module';
import { S3BucketService } from './common/services/s3.service';
import { UserService } from './modules/user/user.service';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    OrderModule,
    CategoryModule,
    SubCategoryModule,
    BrandModule,
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env.prod'],
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI_LOCAL'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('DB connected'));
          connection.on('open', () => console.log('DB open'));
          connection.on('disconnected', () => console.log('DB disconnected'));
          connection.on('reconnected', () => console.log('DB reconnected'));
          connection.on('disconnecting', () => console.log('DB disconnecting'));

          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    ProductModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, S3BucketService],
})
export class AppModule {}
