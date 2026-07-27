import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { Category } from './Category.model';

export interface IBrand {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  logo: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Brand implements IBrand {
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
  })
  slug!: string;
  @Prop({
    type: String,
  })
  image!: string;
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: String,
  })
  logo!: string;
}

const brandSchema = SchemaFactory.createForClass(Brand);

brandSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

export const brandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: brandSchema },
]);
