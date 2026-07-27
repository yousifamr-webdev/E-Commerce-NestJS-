import { Global, Module } from '@nestjs/common';

import userModel from 'src/Models/User.model';
import { UserRepo } from 'src/Repo/user.repo';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from 'src/common/services/redis.service';
import { EmailService } from 'src/common/services/email.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';
import { SecurityService } from 'src/common/module/security/security.service';
import { SecurityModule } from './security/security.module';

@Global()
@Module({
  imports: [userModel, SecurityModule],
  providers: [
    UserRepo,
    RedisService,
    ConfigService,
    JwtService,
    TokenService,
    SecurityService,
    {
      provide: 'Redis_Client',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get('REDIS_URL'),
        });

        client.on('error', (err) => {
          console.log('REDIS ERROR:', err);
        });

        await client.connect();
        console.log('Redis Connected.');

        return client;
      },
    },
  ],

  exports: [UserRepo, RedisService, TokenService, JwtService],
})
export class SharedModule {}
