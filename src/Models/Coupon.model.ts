import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './User.model';
import { Product } from './Product.model';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';

export interface ICoupon {
  createdBy: Types.ObjectId;
  code: string;
  discountDetials: {
    disocuntType: DiscountTypeEnum;
    discountValue: number;
  };
  isActive: boolean;
  activationDate?: Date;
  deactivationDate?: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
  id: false,
})
export class Coupon implements ICoupon {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: String, required: true })
  code!: string;

  @Prop({
    type: {
      disocuntType: {
        type: Number,
        enum: DiscountTypeEnum,
        required: true,
      },
      discountValue: {
        type: Number,
        required: true,
      },
    },
    required: true,
  })
  discountDetials!: {
    disocuntType: DiscountTypeEnum;
    discountValue: number;
  };

  @Prop({ type: Boolean, default: false })
  isActive!: boolean;

  @Prop({ type: Date })
  activationDate?: Date;

  @Prop({ type: Date })
  deactivationDate?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  deletedBy?: Types.ObjectId;
}

const couponSchema = SchemaFactory.createForClass(Coupon);

export const couponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
