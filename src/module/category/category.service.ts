import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, ICategory } from 'src/Models/Category.model';
import { Model } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createCategory(file: Express.Multer.File, data: Partial<ICategory>) {
    const isNameExist = await this.categoryModel.findOne({ name: data.name });
    if (isNameExist) {
      throw new BadRequestException('Name already exists.');
    }
    const key = await this.s3Service.uploadFile({
      file,
      path: `category/${data.slug}`,
    });
    return await this.categoryModel.create({
      image: key,
      name: data.name,
    });
  }

  async updateCategory(
    id: string,
    file: Express.Multer.File,
    data: Partial<ICategory>,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    if (file) {
      if (category.image) {
        await this.s3Service.deleteFile(category.image);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `category/${data.slug}`,
      });
      category.image = key;
    }
    if (data.name) {
      const isNameExist = await this.categoryModel.findOne({
        name: data.name,
        _id: { $ne: id },
      });
      if (isNameExist) {
        throw new BadRequestException('Name already exists.');
      }
      category.name = data.name;
      category.slug = slugify(data.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
    await category.save();
    return category;
  }
}
