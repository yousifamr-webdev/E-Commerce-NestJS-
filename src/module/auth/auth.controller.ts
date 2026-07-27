import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgetPasswordOTPDto,
  LoginDto,
  ResendEmailVerficationDto,
  ResendForgetPasswordVerificationOTPDto,
  SignupDto,
  SignupWithGmailDto,
  VerifyEmailDto,
  VerifyForgetPasswordOTPDto,
} from './dto/authentication.dto';
import { Model } from 'mongoose';
import { User } from 'src/Models/User.model';
import { InjectModel } from '@nestjs/mongoose';
import type { Response } from 'express';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('auth')
export class AuthController {
  constructor(private _AuthService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    bodyData: SignupDto,
  ) {
    const result = await this._AuthService.signup(bodyData);

    return result;
  }

  @Post('login')
  async login(
    @Body()
    bodyData: LoginDto,
  ) {
    const result = await this._AuthService.login(bodyData);

    return result;
  }

  @Post('verify-email')
  async verifyEmail(
    @Body()
    bodyData: VerifyEmailDto,
  ) {
    const result = await this._AuthService.verifyEmail(bodyData);

    return result;
  }
  @Post('verify-email-resendOtp')
  async verifyEmailResendOtp(
    @Body()
    bodyData: ResendEmailVerficationDto,
  ) {
    const result = await this._AuthService.resendEmailVerificationOTP(bodyData);

    return result;
  }
  @Post('forget-password')
  async forgetPassword(
    @Body()
    bodyData: ForgetPasswordOTPDto,
  ) {
    const result = await this._AuthService.forgetPasswordOTP(bodyData);

    return result;
  }
  @Post('forget-password-resend')
  async forgetPasswordResend(
    @Body()
    bodyData: ResendForgetPasswordVerificationOTPDto,
  ) {
    const result =
      await this._AuthService.resendForgetPasswordVerificationOTP(bodyData);

    return result;
  }
  @Post('verify-forget-password')
  async verifyForgetPassword(
    @Body()
    bodyData: VerifyForgetPasswordOTPDto,
  ) {
    const result = await this._AuthService.verifyForgetPasswordOTP(bodyData);

    return result;
  }
  @Post('signup/gmail')
  async signupWithGmail(
    @Body()
    bodyData: SignupWithGmailDto,
  ) {
    const result = await this._AuthService.signupWithGmail(bodyData.idToken);

    return result;
  }
}
