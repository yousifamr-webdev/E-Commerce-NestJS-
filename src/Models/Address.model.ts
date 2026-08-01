import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { AddressTypeEnum } from 'src/common/enum/address.enums';

export interface IAddress {
  user: Types.ObjectId;
  alias: string;
  type: AddressTypeEnum;
  addressLine1: string;
  addressLine2?: string;
  street: string;
  city: string;
  country: string;
  zipCode?: string;
  phone: number;
  isDefault: boolean;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
  id: false,
})
export class Address implements IAddress {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  alias!: string;

  @Prop({
    type: String,
    enum: AddressTypeEnum,
    required: true,
  })
  type!: AddressTypeEnum;

  @Prop({
    type: String,
    required: true,
  })
  addressLine1!: string;

  @Prop({
    type: String,
  })
  addressLine2?: string;

  @Prop({
    type: String,
    required: true,
  })
  street!: string;

  @Prop({
    type: String,
    required: true,
  })
  city!: string;

  @Prop({
    type: String,
    required: true,
    default: 'Egypt',
  })
  country!: string;

  @Prop({
    type: String,
  })
  zipCode?: string;

  @Prop({
    type: Number,
    required: true,
  })
  phone!: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDefault!: boolean;
}

const addressSchema = SchemaFactory.createForClass(Address);

export const addressModel = MongooseModule.forFeature([
  { name: Address.name, schema: addressSchema },
]);
