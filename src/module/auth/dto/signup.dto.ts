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
import { IsMatch } from 'src/common/validation/matchTwoFields.validation';

export class loginDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;
}

export class SignupDto extends loginDto {
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
  @IsEnum(['Male', 'Female'], { message: 'Gender must be Male or Female.' })
  gender!: string;

  @IsOptional()
  @IsPhoneNumber()
  phone!: string;
}
