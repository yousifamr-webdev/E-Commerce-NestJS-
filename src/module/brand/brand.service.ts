import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { S3BucketService } from "src/common/services/s3.service";
import { Brand, IBrand } from "src/Models/Brand.model";
import slugify from 'slugify';




@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createBrand(file: Express.Multer.File, data: Partial<IBrand>) {
    const isNameExist = await this.brandModel.findOne({ name: data.name });
    if (isNameExist) {
      throw new BadRequestException('Name already exists.');
    }
    const key = await this.s3Service.uploadFile({
      file,
      path: `brand/${data.slug}`,
    });
    return await this.brandModel.create({
      image: key,
      name: data.name,
    });
  }

  async updateBrand(
    id: string,
    file: Express.Multer.File,
    data: Partial<IBrand>,
  ) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found.');
    }
    if (file) {
      if (brand.image) {
        await this.s3Service.deleteFile(brand.image);
      }
      const key = await this.s3Service.uploadFile({
        file,
        path: `brand/${data.slug}`,
      });
      brand.image = key;
    }
    if (data.name) {
      const isNameExist = await this.brandModel.findOne({
        name: data.name,
        _id: { $ne: id },
      });
      if (isNameExist) {
        throw new BadRequestException('Name already exists.');
      }
      brand.name = data.name;
      brand.slug = slugify(data.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
    await brand.save();
    return brand;
  }
}