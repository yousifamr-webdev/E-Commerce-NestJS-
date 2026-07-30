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
import { Brand, IBrand } from 'src/Models/Brand.model';
import slugify from 'slugify';
import { customSlugify } from 'src/common/services/slugify.service';
import { FilterBrandsDto } from './dto/brand.find.dto';
import { CreateBrandDto } from './dto/brand.create.dto';
import { UpdateBrandDto } from './dto/brand.update.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createBrand(file: Express.Multer.File, data: CreateBrandDto) {
    const isNameExist = await this.brandModel.exists({ name: data.name });
    if (isNameExist) {
      throw new ConflictException('Brand name already exists.');
    }

    const slug = customSlugify(data.name);
    let key: string | null = null;

    if (file) {
      key = await this.s3Service.uploadFile({
        file,
        path: `brand/${slug}`,
      });
    }

    try {
      const brand = await this.brandModel.create({
        ...data,
        slug,
        ...(key && { logo: key }),
      });
      return brand;
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
      throw error
    }
  }

  async findAllBrands(queryDto: FilterBrandsDto) {
    const { isActive, name } = queryDto;
    const query: _QueryFilter<Brand> = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const brands = await this.brandModel.find(query);

    if (brands.length === 0) {
      throw new NotFoundException('No brands found.');
    }

    return brands;
  }
  async findBrandById(id: String) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException('Failed to find brand.');
    }
    return brand;
  }

  async updateBrand(
    id: string,
    file: Express.Multer.File,
    data: UpdateBrandDto,
  ) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException('brand not found.');
    }

    if (data.name && data.name !== brand.name) {
      const isNameExist = await this.brandModel.exists({
        name: data.name,
        _id: { $ne: id },
      });
      if (isNameExist) {
        throw new ConflictException('brand name already exists.');
      }
      brand.name = data.name;
      brand.slug = customSlugify(data.name);
    }
    if (brand.logo && data.removeLogo) {
      await this.s3Service.deleteFile(brand.logo);
         brand.logo = '';
    }
    if (file) {
      if (brand.logo) {
        await this.s3Service.deleteFile(brand.logo);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `brand/${brand.slug}`,
      });
      brand.logo = key;
    }
    if (data.isActive !== undefined) {
      brand.isActive = data.isActive;
    }

    await brand.save();
    return brand;
  }
  async deleteBrand(id: string) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException('Failed to find brand.');
    }
    if (brand.logo) {
      const key = brand.logo;
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

    await this.brandModel.deleteOne({ _id: id });

    return {
      message: 'Brand deleted successfully.',
      status: HttpStatus.OK,
    };
  }
}
