import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';

class UpdateDiscountDetailsDto {
  @IsOptional()
  @IsEnum(DiscountTypeEnum)
  disocuntType?: DiscountTypeEnum;

  @IsOptional()
  @IsNumber()
  discountValue?: number;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDiscountDetailsDto)
  discountDetials?: UpdateDiscountDetailsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
