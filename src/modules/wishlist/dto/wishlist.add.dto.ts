import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AddProductToWishlistDto {
  @IsNotEmpty()
  @IsMongoId()
  productId!: Types.ObjectId;
}
