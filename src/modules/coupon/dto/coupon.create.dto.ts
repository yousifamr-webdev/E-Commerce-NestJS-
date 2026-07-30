import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';

class DiscountDetailsDto {
  @IsNotEmpty()
  @IsEnum(DiscountTypeEnum)
  disocuntType!: DiscountTypeEnum;

  @IsNotEmpty()
  @IsNumber()
  discountValue!: number;
}

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DiscountDetailsDto)
  discountDetials!: DiscountDetailsDto;

  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  activationDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deactivationDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date;

  @IsOptional()
  @IsMongoId()
  deletedBy?: Types.ObjectId;
}
