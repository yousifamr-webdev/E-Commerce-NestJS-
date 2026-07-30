import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.model';
import { Product } from './Product.model';

export interface IWishlist {
  userId: Types.ObjectId;
  products: Types.ObjectId[];
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
  id: false,
})
export class Wishlist implements IWishlist {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Product.name }],
    default: [],
  })
  products!: Types.ObjectId[];
}

const wishlistSchema = SchemaFactory.createForClass(Wishlist);

export const wishlistModel = MongooseModule.forFeature([
  { name: Wishlist.name, schema: wishlistSchema },
]);
