import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class RemoveProductFromWishlistDto {
  @IsNotEmpty()
  @IsMongoId()
  wishlistId!: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  productId!: Types.ObjectId;
}
