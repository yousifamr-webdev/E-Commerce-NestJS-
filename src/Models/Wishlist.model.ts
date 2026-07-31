import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.model';
import { Product } from './Product.model';

@Schema({
  _id: false,
})
export class WishlistProduct {
  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  productId!: Types.ObjectId;

  @Prop({
    default: Date.now,
  })
  addedAt?: Date;
}

export interface IWishlist {
  userId: Types.ObjectId;
  products: WishlistProduct[];
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
    type: [WishlistProduct],
    default: [],
  })
  products!: WishlistProduct[];
}

const wishlistSchema = SchemaFactory.createForClass(Wishlist);

wishlistSchema.index(
  {
    userId: 1,
  },
  { unique: true },
);

export const wishlistModel = MongooseModule.forFeature([
  { name: Wishlist.name, schema: wishlistSchema },
]);
