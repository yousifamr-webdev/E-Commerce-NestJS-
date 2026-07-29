import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { _QueryFilter, Model } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { customSlugify } from 'src/common/services/slugify.service';
import { Category } from 'src/Models/Category.model';
import { CreateCategoryDto } from './dto/category.create.dto';
import { UpdateCategoryDto } from './dto/category.update.dto';
import { FilterCategoriesDto } from './dto/category.find.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createCategory(file: Express.Multer.File, data: CreateCategoryDto) {
    const isNameExist = await this.categoryModel.exists({ name: data.name });
    if (isNameExist) {
      throw new ConflictException('Category name already exists.');
    }

    const slug = customSlugify(data.name);
    let key: string | null = null;

    if (file) {
      key = await this.s3Service.uploadFile({
        file,
        path: `category/${slug}`,
      });
    }

    try {
      const category = await this.categoryModel.create({
        ...data,
        slug,
        ...(key && { image: key }),
      });
      return category;
    } catch (error) {
      if (key) {
        try {
          await this.s3Service.deleteFile(key);
        } catch (s3Error) {
          console.error(
            `CRITICAL: Failed to delete orphaned S3 file: ${key}`,
            s3Error,
          );
        }
      }
      throw new BadRequestException('Failed to create new category.');
    }
  }

  async findAllCategories(queryDto: FilterCategoriesDto) {
    const { isActive, name } = queryDto;
    const query: _QueryFilter<Category> = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const categories = await this.categoryModel.find(query);

    if (categories.length === 0) {
      throw new NotFoundException('No categories found.');
    }

    return categories;
  }
  async findCategoryById(id: String) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Failed to find category.');
    }
    return category;
  }

  async updateCategory(
    id: string,
    file: Express.Multer.File,
    data: UpdateCategoryDto,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    if (data.name && data.name !== category.name) {
      const isNameExist = await this.categoryModel.exists({
        name: data.name,
        _id: { $ne: id },
      });
      if (isNameExist) {
        throw new ConflictException('Category name already exists.');
      }
      category.name = data.name;
      category.slug = customSlugify(data.name);
    }
    if (category.image && data.removeImage) {
      await this.s3Service.deleteFile(category.image);
      category.image = '';
    }
    if (file) {
      if (category.image) {
        await this.s3Service.deleteFile(category.image);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `category/${category.slug}`,
      });
      category.image = key;
    }
    if (data.isActive !== undefined) {
      category.isActive = data.isActive;
    }

    await category.save();
    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Failed to find category.');
    }
    if (category.image) {
      const key = category.image;
      if (key) {
        try {
          await this.s3Service.deleteFile(key);
        } catch (s3Error) {
          console.error(
            `CRITICAL: Failed to delete orphaned S3 file: ${key}`,
            s3Error,
          );
        }
      }
    }

    await this.categoryModel.deleteOne({ _id: id });

    return {
      message: 'Category deleted successfully.',
      status: HttpStatus.OK,
    };
  }
}
