import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import userModel from 'src/Models/user.model';
import { UserRepo } from 'src/Repo/user.repo';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepo],
  exports: [AuthService],
  imports:[userModel]
})
export class AuthModule {}
