import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { S3BucketService } from 'src/common/services/s3.service';
import { Category } from 'src/Models/Category.model';
import { ISubCategory, SubCategory } from 'src/Models/SubCategory.model';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    private readonly CategoryModel: Model<Category>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createSubcategory(
    categoryId: string,
    file: Express.Multer.File,
    data: Partial<ISubCategory>,
  ) {
    const category = await this.CategoryModel.findById(categoryId);
    if (!category) {
      throw new BadRequestException('Category does not exist.');
    }

    const isNameExist = await this.subCategoryModel.findOne({
      name: data.name,
    });
    if (isNameExist) {
      throw new BadRequestException('Name already exists.');
    }
    const key = await this.s3Service.uploadFile({
      file,
      path: `subcategory/${data.slug}`,
    });
    return await this.subCategoryModel.create({
      image: key,
      name: data.name,
      categoryId,
    });
  }

  async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    file: Express.Multer.File,
    data: Partial<ISubCategory>,
  ) {
    const category = await this.CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException('category not found.');
    }
    const subCategory = await this.subCategoryModel.findById(subcategoryId);
    if (!subCategory) {
      throw new NotFoundException('subcategory not found.');
    }
    if (file) {
      if (subCategory.image) {
        await this.s3Service.deleteFile(subCategory.image);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `subcategory/${data.slug}`,
      });
      subCategory.image = key;
    }
    if (data.name) {
      const isNameExist = await this.subCategoryModel.findOne({
        name: data.name,
        _id: { $ne: subcategoryId },
      });
      if (isNameExist) {
        throw new BadRequestException('Name already exists.');
      }
      subCategory.name = data.name;
      subCategory.slug = slugify(data.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
    await subCategory.save();
    return subCategory;
  }
}
