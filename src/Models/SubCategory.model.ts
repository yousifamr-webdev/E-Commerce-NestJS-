import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import slugify from 'slugify';
import { Category } from './Category.model';

export interface ISubCategory {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  categoryId: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class SubCategory implements ISubCategory {
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
    set: function (this: SubCategory) {
      const slug = slugify(this.name);
      return slug;
    },
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
    type: mongoose.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  categoryId!: string;
}

const subCategorySchema = SchemaFactory.createForClass(SubCategory);

subCategorySchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});


export const subCategoryModel = MongooseModule.forFeature([
  { name: SubCategory.name, schema: subCategorySchema },
]);
