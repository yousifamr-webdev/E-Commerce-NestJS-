import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';

export interface ICategory {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Category implements ICategory {
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
}

const categorySchema = SchemaFactory.createForClass(Category);

categorySchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

export const categoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: categorySchema },
]);
