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
import { CartProduct } from 'src/Models/Cart.model';

export class UpdateCartDto {
  @IsNotEmpty()
  products!: CartProduct[];
}
