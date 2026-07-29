import { Transform } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { GenderEnum } from 'src/common/enum/user.enums';
import { IsMatch } from 'src/common/validation/matchTwoFields.validation';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsString()
  FCM!: string;
}

export class SignupDto extends LoginDto {
  @MaxLength(20)
  @MinLength(3)
  @IsString()
  userName!: string;

  @ValidateIf((obj) => {
    return obj.passwrod;
  })
  @IsMatch(['password'])
  confirmPassword!: string;

  @IsOptional()
  @IsEnum(GenderEnum, { message: 'Gender must be Male or Female.' })
  gender!: string;

  @IsOptional()
  @IsPhoneNumber()
  phone!: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  otp!: string;
}
export class ResendEmailVerficationDto {
  @IsEmail()
  email!: string;
}

export class ForgetPasswordOTPDto extends ResendEmailVerficationDto {}

export class ResendForgetPasswordVerificationOTPDto extends ResendEmailVerficationDto {}

export class VerifyForgetPasswordOTPDto extends VerifyEmailDto {}

export class ResetPasswordDto extends VerifyEmailDto {
  @IsStrongPassword()
  password!: string;
}

export class SignupWithGmailDto {
  @IsString()
  idToken!:string
}