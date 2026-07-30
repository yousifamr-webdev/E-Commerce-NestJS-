import { Prop } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CartProduct } from 'src/Models/Cart.model';

export class AddProductToCartDto {
  @IsNotEmpty()
  product!: CartProduct;
}
