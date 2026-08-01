import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressTypeEnum } from 'src/common/enum/address.enums';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  alias!: string;

  @IsNotEmpty()
  @IsEnum(AddressTypeEnum)
  type!: AddressTypeEnum;

  @IsNotEmpty()
  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  street!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsNotEmpty()
  @Type(() => Number)
  phone!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
