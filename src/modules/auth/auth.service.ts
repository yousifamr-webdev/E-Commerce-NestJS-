import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CryptoJS from 'crypto-js';
import { OAuth2Client } from 'google-auth-library';
import { OTPEnum } from 'src/common/enum/otp.enums';
import { ProviderEnum } from 'src/common/enum/user.enums';
import { SecurityService } from 'src/common/module/security/security.service';
import { EmailService } from 'src/common/services/email.service';
import { RedisService } from 'src/common/services/redis.service';
import { TokenService } from 'src/common/services/token.service';
import { UserDocument } from 'src/Models/User.model';
import { UserRepo } from 'src/Repo/user.repo';
import {
  ForgetPasswordOTPDto,
  LoginDto,
  ResendEmailVerficationDto,
  ResendForgetPasswordVerificationOTPDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
  VerifyForgetPasswordOTPDto,
} from './dto/authentication.dto';

@Injectable()
export class AuthService {
  constructor(
    private _redisService: RedisService,
    private _emailService: EmailService,
    private _tokenService: TokenService,
    private _userRepo: UserRepo,
    private _securityService: SecurityService,
    private _configService: ConfigService,
  ) {}

  private async _verifyGoogleToken(idToken: string) {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: this._configService.get<string>('GOOGLE_CLIENT_ID')!,
    });

    const payload = ticket.getPayload();

    return payload;
  }

  private async _verifyOTP(email: string, otp: string, otpType: OTPEnum) {
    const otpDoc = await this._redisService.get(
      this._redisService.getOTPKey({
        email,
        otpType,
      }),
    );

    if (!otpDoc) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isOTPValid = await this._securityService.compareHash({
      plainText: otp,
      cipherText: String(otpDoc),
    });

    if (!isOTPValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }
  }

  public async signup(bodyData: SignupDto): Promise<UserDocument> {
    const { email, password, phone } = bodyData;
    const isEmail = await this._userRepo.findOne({ filter: { email } });
    if (isEmail) {
      throw new ConflictException('Email already exists.');
    }

    const [user] = await this._userRepo.create({ data: [bodyData] });

    if (!user) {
      throw new BadRequestException('Failed to create user.');
    }

    return user;
  }
  public async login(bodyData: LoginDto) {
    const { email, password } = bodyData;

    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.confirmEmail) {
      throw new NotFoundException('Please confirm your email first.');
    }

    await this._emailService.checkLoginBlock(user);

    const isPasswordValid = await this._securityService.compareHash({
      plainText: password,
      cipherText: user.password,
    });

    if (!isPasswordValid) throw new BadRequestException('Invalid password.');

    await this._emailService.sendLoginOtp(user);

    const bytes = CryptoJS.AES.decrypt(
      user.phone as string,
      this._configService.get<string>('ENCRYPTION_KEY')!,
    );

    const originalPhone = bytes.toString(CryptoJS.enc.Utf8);

    user.phone = originalPhone;

    // if (bodyData.FCM) {
    //   await this._redisService.addFCMTokenToSet(user._id, bodyData.FCM);

    //   const tokens = await this._redisService.getMemberFCMToken(user._id);

    //   await this._notificationService.sendMultipleNotifications({
    //     tokens,
    //     data: {
    //       title: 'User Logged In Succesfully.',
    //       body: `Logged in at ${new Date()}`,
    //     },
    //   });
    // }

    const { access_token, refresh_token } =
      this._tokenService.generateAccessAndRefreshTokens({
        role: user.role,
        sub: String(user._id),
      });

    return { access_token, refresh_token };
  }

  public async signupWithGmail(idToken: string) {
    const payload = await this._verifyGoogleToken(idToken);

    if (payload == undefined) {
      throw new BadRequestException('Token Payload is invalid.');
    }

    if (!payload.email_verified) {
      throw new BadRequestException('Email must be verified.');
    }

    const user = await this._userRepo.findOne({
      filter: { email: payload.email as string },
    });

    if (user) {
      if (user.provider === ProviderEnum.System) {
        throw new BadRequestException(
          'Account already exists. Please login with your email and password.',
        );
      }
      return await this.loginWithGoogle(idToken);
    }

    const [firstName, lastName] = payload.name!.split(' ');

    const [newUser] = await this._userRepo.create({
      data: [
        {
          email: payload.email,
          userName: payload.name,
          profilePic: payload.picture,
          confirmEmail: true,
          provider: ProviderEnum.Google,
        },
      ],
    });

    if (!newUser) {
      throw new BadRequestException('Failed to create user.');
    }

    const { access_token, refresh_token } =
      this._tokenService.generateAccessAndRefreshTokens({
        role: newUser.role,
        sub: String(newUser._id),
      });

    return {
      access_token,
      refresh_token,
    };
  }

  public async loginWithGoogle(idToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = await this._verifyGoogleToken(idToken);

    if (payload == undefined) {
      throw new BadRequestException('Token Payload is invalid.');
    }

    if (!payload.email_verified) {
      throw new BadRequestException('Email must be verified.');
    }

    const user = await this._userRepo.findOne({
      filter: { email: payload.email as string, provider: ProviderEnum.Google },
    });

    if (!user) {
      throw new BadRequestException("User doesn't exist.");
    }

    const { access_token, refresh_token } =
      this._tokenService.generateAccessAndRefreshTokens({
        role: user.role,
        sub: String(user._id),
      });

    return {
      access_token,
      refresh_token,
    };
  }

  public async verifyEmail(bodyData: VerifyEmailDto) {
    const { email, otp } = bodyData;

    const otpType = OTPEnum.confirmEmail;

    await this._verifyOTP(email, otp, otpType);

    await this._userRepo.updateOne({
      filter: { email },
      update: { confirmEmail: true, $unset: { confirmEmailExpires: 1 } },
    });

    await this._redisService.del(
      this._redisService.getOTPKey({
        email: email,
        otpType: OTPEnum.confirmEmail,
      }),
    );

    return { msg: 'Email verified Successfully' };
  }

  public async resendEmailVerificationOTP(bodyData: ResendEmailVerficationDto) {
    const { email } = bodyData;

    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: false },
    });

    if (!user) {
      throw new BadRequestException("Email doesn't exist.");
    }

    if (user.confirmEmail) {
      throw new BadRequestException('Email already verified.');
    }

    await this._emailService.sendConfirmEmail(user);

    return { msg: 'Verification code was sent to your email.' };
  }

  public async forgetPasswordOTP(bodyData: ForgetPasswordOTPDto) {
    const { email } = bodyData;

    const user = await this._userRepo.findOne({ filter: { email } });

    if (!user) {
      throw new BadRequestException("User doesn't exist.");
    }

    if (!user.confirmEmail) {
      throw new BadRequestException('Please confirm your email first.');
    }

    await this._emailService.sendForgetPassword(email);

    return { msg: 'Check your Email.' };
  }

  public async resendForgetPasswordVerificationOTP(
    bodyData: ResendForgetPasswordVerificationOTPDto,
  ) {
    const { email } = bodyData;

    await this._emailService.sendForgetPassword(email);
    return { msg: 'Verification code was sent to your email.' };
  }

  public async verifyForgetPasswordOTP(bodyData: VerifyForgetPasswordOTPDto) {
    const { email, otp } = bodyData;

    const otpType = OTPEnum.forgetPassword;

    await this._verifyOTP(email, otp, otpType);

    return { msg: 'Verfied Successfully.' };
  }

  public async resetPasswordOTP(bodyData: ResetPasswordDto) {
    const { email, password, otp } = bodyData;

    await this.verifyForgetPasswordOTP({ email, otp });

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        password: await this._securityService.generateHash({
          plainText: password,
        }),
      },
    });

    return { msg: 'Your password was reset successfully.' };
  }



  
}
