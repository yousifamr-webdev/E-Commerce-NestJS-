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
import { GetAllProductsDto } from './dto/product.find.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly s3Service: S3BucketService,
  ) {}

  validateDiscount(discount: DiscountDto | undefined, price: number): number {
    if (price < 0) {
      throw new BadRequestException('Price cannot be negative.');
    }

    if (discount) {
      if (discount.value < 0) {
        throw new BadRequestException('Discount value cannot be negative.');
      }
      if (
        (discount.discountType === DiscountTypeEnum.Percentage &&
          discount.value > 100) ||
        (discount.discountType === DiscountTypeEnum.Static &&
          discount.value > price)
      ) {
        throw new BadRequestException('Invalid discount value.');
      }
      return this.productRepo.calcPriceAfterDiscount(
        discount.discountType,
        price,
        discount.value,
      );
    }

    return price;
  }

  async createProduct(data: CreateProductDto, gallery: string[]) {
    const priceAfterDiscount = this.validateDiscount(
      data.discount as DiscountDto,
      data.price,
    );

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
      throw new NotFoundException(
        'Subcategory not found or does not belong to category.',
      );
    }
    if (!brand) {
      throw new NotFoundException('Brand not found.');
    }

    const product = await this.productRepo.create({
      data: {
        ...data,
        gallery,
        priceAfterDiscount,
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

    const newPrice = data.price ?? product.price;
    const newDiscount =
      data.discount !== undefined ? data.discount : product.discount;

    const priceAfterDiscount = this.validateDiscount(
      newDiscount as DiscountDto,
      newPrice,
    );

    product.price = newPrice;
    product.discount = newDiscount;
    product.priceAfterDiscount = priceAfterDiscount;

    if (data.category || data.subCategory) {
      const targetCategory = data.category ?? product.category;
      const targetSubCategory = data.subCategory ?? product.subCategory;

      const [category, subCategory] = await Promise.all([
        this.productRepo.checkCategoryExists(targetCategory),
        this.productRepo.checkSubCategoryExists(
          targetSubCategory,
          targetCategory,
        ),
      ]);

      if (!category) {
        throw new NotFoundException('Category not found.');
      }
      if (!subCategory) {
        throw new NotFoundException(
          'Subcategory not found or does not belong to category.',
        );
      }

      if (data.category)
        product.category = data.category as unknown as Types.ObjectId;
      if (data.subCategory)
        product.subCategory = data.subCategory as unknown as Types.ObjectId;
    }

    if (data.brand) {
      const brand = await this.productRepo.checkBrandExists(data.brand);
      if (!brand) {
        throw new NotFoundException('Brand not found.');
      }
      product.brand = data.brand as unknown as Types.ObjectId;
    }

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

    if (data.name && data.name !== product.name) {
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

    if (data.description !== undefined) product.description = data.description;
    if (data.stock !== undefined) product.stock = data.stock;

    product.isActive = data.isActive ?? product.isActive;
    await product.save();

    return {
      status: HttpStatus.OK,
      message: 'Done',
      product,
    };
  }

  async getAllProducts(filterParams: GetAllProductsDto) {
    const filter: Record<string, any> = {
      ...(filterParams.category && { category: filterParams.category }),
      ...(filterParams.subCategory && {
        subCategory: filterParams.subCategory,
      }),
      ...(filterParams.brand && { brand: filterParams.brand }),
    };

    if (
      filterParams.minPrice !== undefined ||
      filterParams.maxPrice !== undefined
    ) {
      filter.price = {};
      if (filterParams.minPrice !== undefined)
        filter.price.$gte = filterParams.minPrice;
      if (filterParams.maxPrice !== undefined)
        filter.price.$lte = filterParams.maxPrice;
    }

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 20;

    const products = await this.productRepo.paginate({
      filter,
      page,
      limit,
    });

    return {
      message: 'Products were retrieved successfully',
      products,
    };
  }

  async getProductById(productId: Types.ObjectId | string) {
    const product = await this.productRepo.findById({
      id: productId,
      options: {
        populate: ['category', 'subCategory', 'brand'],
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return {
      message: 'Product retrieved successfully',
      product,
    };
  }
}
