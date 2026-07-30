import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  cartId!: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  phone!: number;

  @IsNotEmpty()
  @IsString()
  address!: string;
}
