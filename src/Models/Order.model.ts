import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.model';
import { Product } from './Product.model';
import {
  DeliveryStatusEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from 'src/common/enum/order.enums';
import { Cart } from './Cart.model';
import { Coupon } from './Coupon.model';

@Schema({
  _id: false,
  id: false,
})
export class PaymentDetails {
  @Prop({
    type: Number,
    enum: PaymentStatusEnum,
    required: true,
    default: PaymentStatusEnum.Pending,
  })
  paymentStatus!: PaymentStatusEnum;

  @Prop({
    type: Number,
    enum: PaymentTypeEnum,
    required: true,
    default: PaymentTypeEnum.COD,
  })
  paymentType!: PaymentTypeEnum;
}

export interface IOrder {
  userId: Types.ObjectId;
  cart: Types.ObjectId;
  totalPrice: number;
  phone: number;
  address: string;
  coupon?: Types.ObjectId;
  deliveryStatus: DeliveryStatusEnum;
  paymentDetails: PaymentDetails;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  paymentIntent?: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
  id: false,
})
export class Order implements IOrder {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Cart.name, required: true })
  cart!: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  totalPrice!: number;

  @Prop({
    type: Types.ObjectId,
    ref: Coupon.name,
  })
  coupon?: Types.ObjectId;

  @Prop({ type: Number, required: true })
  phone!: number;

  @Prop({ type: String, required: true })
  address!: string;

  @Prop({
    type: Number,
    enum: DeliveryStatusEnum,
    required: true,
    default: DeliveryStatusEnum.ProcessingOrder,
  })
  deliveryStatus!: DeliveryStatusEnum;

  @Prop({ type: PaymentDetails, required: true })
  paymentDetails!: PaymentDetails;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  deletedBy?: Types.ObjectId;

  @Prop({ type: String })
  paymentIntent?: string;
}

const orderSchema = SchemaFactory.createForClass(Order);

export const orderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
