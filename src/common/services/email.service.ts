import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { OTPEnum } from 'src/common/enum/otp.enums';
import { RedisService } from './redis.service';
import { UserDocument } from 'src/Models/User.model';
import { SecurityService } from '../module/security/security.service';
import { generateOTP } from './otp.service';

type SendOtpOptions = {};

@Injectable()
export class EmailService {
  private EMAIL_USER: string;
  private EMAIL_PASS: string;
  private OTP_EXPIRE: number;
  private MAX_ATTEMPTS: number;
  private BLOCK_TIME: number;

  constructor(
    private _configService: ConfigService,
    private _redisMethods: RedisService,
    private _securityService: SecurityService,
  ) {
    this.EMAIL_USER = _configService.get<string>('EMAIL_USER')!;
    this.EMAIL_PASS = _configService.get<string>('EMAIL_PASS')!;
    this.OTP_EXPIRE = 300;
    this.MAX_ATTEMPTS = 5;
    this.BLOCK_TIME = this.OTP_EXPIRE * 2;
  }

  sendEmail = async ({
    to,
    subject,
    html,
  }: {
    to: string | string[];
    subject: string;
    html?: string;
  }) => {
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: this.EMAIL_USER,
        pass: this.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Sara7a App" <${this.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  };

  //  Centralized OTP Flow
  private async _handleOtp({
    email,
    otpType,
    subject,
    enforceCooldown = true,
  }: {
    email: string;
    otpType: OTPEnum;
    subject: string;
    enforceCooldown?: boolean;
  }) {
    const otpKey = this._redisMethods.getOTPKey({ email, otpType });
    const blockKey = this._redisMethods.getOTPBlockedStatusKey({
      email,
      otpType,
    });
    const reqKey = this._redisMethods.getOTPReqNoKey({ email, otpType });

    //  Cooldown check
    if (enforceCooldown) {
      const ttl = await this._redisMethods.ttl(otpKey);
      if (ttl > 0) {
        throw new BadRequestException(
          `Wait ${ttl}s before requesting another OTP.`,
        );
      }
    }

    //  Block check
    const blockedTTL = await this._redisMethods.ttl(blockKey);
    if (blockedTTL > 0) {
      throw new BadRequestException(
        `Too many attempts. Try again in ${blockedTTL}s.`,
      );
    }

    //  Generate OTP
    const otp = generateOTP();
    const hashedOTP = await this._securityService.generateHash({
      plainText: otp,
    });

    //  Store OTP
    await this._redisMethods.set({
      key: otpKey,
      value: hashedOTP,
      exValue: this.OTP_EXPIRE,
    });

    //  Increment attempts
    const attempts = await this._redisMethods.incr(reqKey);

    // Set expiry for attempts if first time
    if (attempts === 1) {
      await this._redisMethods.setExpire({
        key: reqKey,
        exValue: this.OTP_EXPIRE * 5,
      });
    }

    //  Block if max reached
    if (attempts >= this.MAX_ATTEMPTS) {
      await this._redisMethods.set({
        key: blockKey,
        value: 1,
        exValue: this.BLOCK_TIME,
      });
    }

    //  Send email
    await this.sendEmail({
      to: email,
      subject,
      html: `<h2>Your verification code is ${otp}</h2>
             <p>This code expires in 5 minutes.</p>`,
    });
  }

  //  Public APIs

  public async sendConfirmEmail(user: UserDocument) {
    await this._handleOtp({
      email: user.email,
      otpType: OTPEnum.confirmEmail,
      subject: 'Email confirmation',
      enforceCooldown: true,
    });
  }

  public async sendLoginOtp(user: UserDocument) {
    if (!user.twoStepVerification) return;

    await this._handleOtp({
      email: user.email,
      otpType: OTPEnum.Login,
      subject: '2-Step Login',
    });

    return { msg: 'Please check your email.' };
  }

  public async checkLoginBlock(user: UserDocument) {
    const blockTTL = await this._redisMethods.ttl(
      this._redisMethods.getOTPBlockedStatusKey({
        email: user.email,
        otpType: OTPEnum.Login,
      }),
    );

    if (blockTTL > 0) {
      throw new BadRequestException(
        `Too many attempts. Try again in ${blockTTL}s.`,
      );
    }
  }

  public async sendForgetPassword(email: string) {
    await this._handleOtp({
      email,
      otpType: OTPEnum.forgetPassword,
      subject: 'Reset your password',
      enforceCooldown: true,
    });
  }
}
