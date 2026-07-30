import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.model';
import { Product } from './Product.model';
import { Coupon } from './Coupon.model';

@Schema({
  _id: false,
  id: false,
})
export class CartProduct {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  quantity!: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice!: number;
}

export interface ICart {
  userId: Types.ObjectId;
  products: CartProduct[];
  coupon?: Types.ObjectId;
  totalPrice: number;
  totalPriceAfterDiscount: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
  id: false,
})
export class Cart implements ICart {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: [CartProduct],
    default: [],
  })
  products!: CartProduct[];

  @Prop({
    type: Types.ObjectId,
    ref: Coupon.name,
  })
  coupon?: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  totalPrice!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalPriceAfterDiscount!: number;
}

const cartSchema = SchemaFactory.createForClass(Cart);

function calculateTotalPrice(products: CartProduct[]) {
  return products.reduce(
    (total, product) => total + product.quantity * product.unitPrice,
    0,
  );
}

cartSchema.pre('save', function () {
  this.totalPrice = calculateTotalPrice(this.products);
});

export const cartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);
