import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import slugify from 'slugify';
import { Category } from './Category.model';
import { DiscountEnum } from 'src/common/enum/product.enum';
import { Brand } from './Brand.model';
import { SubCategory } from './SubCategory.model';

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount: number;
  discount: {
    value: number;
    type: DiscountEnum;
  };
  stock: number;
  gallery: string[];
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  brand: Types.ObjectId;
  rating: {
    avg: number;
    count: number;
  };
  isActive: boolean;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Product implements IProduct {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    set: function (this: Product) {
      const slug = slugify(this.name);
      return slug;
    },
  })
  slug!: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Brand.name,
  })
  brand!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Category.name,
  })
  category!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: SubCategory.name,
  })
  subCategory!: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  stock!: number;
  @Prop({
    type: String,
    required: true,
  })
  description!: string;

  @Prop({
    type: {
      discount: Number,
      type: {
        type: Number,
        enum: DiscountEnum,
      },
    },
  })
  discount!: {
    value: number;
    type: DiscountEnum;
  };

  @Prop({
    type: [String],
  })
  gallery!: string[];

  @Prop({
    type: Number,
  })
  price!: number;
  @Prop({
    type: Number,
    required: true,
  })
  priceAfterDiscount!: number;
  @Prop({
    type: {
      avg: Number,
      count: Number,
    },
  })
  rating!: {
    avg: number;
    count: number;
  };

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;
}

const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});


export const productModel = MongooseModule.forFeature([
  { name: Product.name, schema: productSchema },
]);
