import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';
import { IProduct } from 'src/Models/Product.model';

export class DiscountDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value!: number;

  @IsEnum(DiscountTypeEnum)
  @Type(() => Number)
  discountType!: DiscountTypeEnum;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsString()
  @IsNotEmpty()
  category!: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  subCategory!: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  brand!: Types.ObjectId;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
  
}
