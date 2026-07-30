import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, DiscountDto } from './dto/product.create.dto';
import { ProductRepo } from 'src/Repo/product.repo';

import slugify from 'slugify';
import { Types } from 'mongoose';
import { UpdateProductDto } from './dto/product.update.dto';
import { S3BucketService } from 'src/common/services/s3.service';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';
import { customSlugify } from 'src/common/services/slugify.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly s3Service: S3BucketService,
  ) {}

  validateDiscount(discount: DiscountDto, price: number) {
    let priceAfterDiscount: number = price;
    if (discount) {
      if (
        (discount.discountType == DiscountTypeEnum.Percentage &&
          discount.value > 100) ||
        (discount.discountType == DiscountTypeEnum.Static &&
          discount.value > price)
      ) {
        throw new BadRequestException('Invalid discount value.');
      }
      priceAfterDiscount = this.productRepo.calcPriceAfterDiscount(
        discount.discountType,
        price,
        discount.value,
      );
      return priceAfterDiscount;
    }
  }

  async createProduct(data: CreateProductDto, gallery: string[]) {
    let priceAfterDiscount: number = data.price;

    this.validateDiscount(data.discount as DiscountDto, data.price);

    const isNameExist = await this.productRepo.findOne({
      filter: { name: data.name },
    });
    if (isNameExist) {
      throw new BadRequestException('Name already exists.');
    }
    const [category, subCategory, brand] = await Promise.all([
      this.productRepo.checkCategoryExists(data.category),
      this.productRepo.checkSubCategoryExists(data.subCategory, data.category),
      this.productRepo.checkBrandExists(data.brand),
    ]);
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    if (!subCategory) {
      throw new NotFoundException('Subcategory not found.');
    }
    if (!brand) {
      throw new NotFoundException('Brand not found.');
    }
    const product = await this.productRepo.create({
      data: {
        ...data,
        gallery,
        priceAfterDiscount: priceAfterDiscount,
        slug: customSlugify(data.name),
      },
    });
    return {
      product,
      message: 'Done',
      status: HttpStatus.CREATED,
    };
  }

  async updateProduct(
    id: string | Types.ObjectId,
    data: UpdateProductDto,
    gallery: string[],
  ) {
    const product = await this.productRepo.findById({ id });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const priceAfterDiscount = this.validateDiscount(
      data.discount || product.discount,
      data.price || product.price,
    );

    product.price = data.price || product.price;
    product.discount = data.discount || product.discount;
    product.priceAfterDiscount = priceAfterDiscount as number;

    if (data.deletedImages?.length) {
      await this.s3Service.deleteFiles(
        data.deletedImages.map((ele) => {
          return { Key: ele };
        }),
      );
      product.gallery = product.gallery.filter((ele) => {
        return !data.deletedImages?.includes(ele);
      });
    }
    if (data.name) {
      const isNameExist = await this.productRepo.findOne({
        filter: {
          name: data.name,
          _id: {
            $ne: id,
          },
        },
      });
      if (isNameExist) {
        throw new BadRequestException('Name already exists.');
      }
      product.name = data.name;
      product.slug = customSlugify(data.name);
    }
    if (gallery?.length) {
      product.gallery.push(...gallery);
    }
    product.isActive = data.isActive ?? product.isActive;
    await product.save();
    return {
      status: HttpStatus.OK,
      message: 'Done',
      product,
    };
  }
}
