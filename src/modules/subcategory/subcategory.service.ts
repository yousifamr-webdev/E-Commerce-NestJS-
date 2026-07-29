import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { _QueryFilter, Model, Types } from 'mongoose';
import slugify from 'slugify';
import { S3BucketService } from 'src/common/services/s3.service';
import { customSlugify } from 'src/common/services/slugify.service';
import { Category } from 'src/Models/Category.model';
import { ISubCategory, SubCategory } from 'src/Models/SubCategory.model';
import { CreateSubcategoryDto } from './dto/subcategory.create.dto';
import { UpdateSubcategoryDto } from './dto/subcategory.update.dto';
import { FilterSubcategoriessDto } from './dto/subcategory.find.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name)
    private readonly CategoryModel: Model<Category>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createSubcategory(
    file: Express.Multer.File,
    data: CreateSubcategoryDto,
  ) {
    const isCategoryExist = await this.CategoryModel.exists({
      _id: data.categoryId,
    });
    if (!isCategoryExist) {
      throw new BadRequestException('Category does not exist.');
    }

    const isNameExist = await this.subCategoryModel.exists({ name: data.name });
    if (isNameExist) {
      throw new ConflictException('Name already exists.');
    }

    const slug = customSlugify(data.name);
    let key: string | null = null;

    if (file) {
      key = await this.s3Service.uploadFile({
        file,
        path: `subcategory/${slug}`,
      });
    }

    try {
      const subCategory = await this.subCategoryModel.create({
        ...data,
        slug,
        ...(key && { image: key }),
      });
      return subCategory;
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
      throw new BadRequestException('Failed to create new subcategory.');
    }
  }

  async findAllSubcategories(queryDto: FilterSubcategoriessDto) {
    const { isActive, name, categoryId } = queryDto;
    const query: _QueryFilter<SubCategory> = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    if (categoryId !== undefined) {
      query.categoryId = categoryId;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const subcategories = await this.subCategoryModel.find(query);

    if (subcategories.length === 0) {
      throw new NotFoundException('No subcategories found.');
    }

    return subcategories;
  }
  async findSubcategoryById(id: String) {
    const subcategory = await this.subCategoryModel.findById(id);
    if (!subcategory) {
      throw new NotFoundException('Failed to find subcategory.');
    }
    return subcategory;
  }

  async updateSubcategory(
    subcategoryId: string,
    file: Express.Multer.File,
    data: UpdateSubcategoryDto,
  ) {
    const category = await this.CategoryModel.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException('category not found.');
    }

    const subCategory = await this.subCategoryModel.findById(subcategoryId);
    if (!subCategory) {
      throw new NotFoundException('subcategory not found.');
    }

    if (data.name && data.name !== subCategory.name) {
      const isNameExist = await this.subCategoryModel.exists({
        name: data.name,
        _id: { $ne: subcategoryId },
      });
      if (isNameExist) {
        throw new ConflictException('Name already exists.');
      }
      subCategory.name = data.name;
      subCategory.slug = customSlugify(data.name);
    }
    if (subCategory.image && data.removeImage) {
   
   await this.s3Service.deleteFile(subCategory.image);
   subCategory.image = ""
 }
    if (file) {
      if (subCategory.image) {
        await this.s3Service.deleteFile(subCategory.image);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `subcategory/${subCategory.slug}`,
      });
      subCategory.image = key;
    }

    if (data.isActive !== undefined) {
      subCategory.isActive = data.isActive;
    }

    await subCategory.save();
    return subCategory;
  }

  async deleteSubcategory(id: string) {
    const subcategory = await this.subCategoryModel.findById(id);
    if (!subcategory) {
      throw new NotFoundException('Failed to find subcategory.');
    }
    if (subcategory.image) {
      const key = subcategory.image;
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

    await this.subCategoryModel.deleteOne({ _id: id });

    return {
      message: 'Subcategory deleted successfully.',
      status: HttpStatus.OK,
    };
  }
}
