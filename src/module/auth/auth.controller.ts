import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Model } from 'mongoose';
import { User } from 'src/Models/user.model';
import { InjectModel } from '@nestjs/mongoose';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('auth')
export class AuthController {
  constructor(
    private _AuthService: AuthService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}
  @Get()
  async getAuthPage() {
    return await this._AuthService.getAuthPage();
  }

  @Post('signup')
  signup(
    @Body()
    bodyData: SignupDto,
  ) {
    return { messae: 'done', bodyData };
  }
}
