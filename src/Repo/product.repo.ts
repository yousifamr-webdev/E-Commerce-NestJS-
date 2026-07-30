import { Model, Types } from 'mongoose';
import DBRepo from './db.repo.js';
import { InjectModel } from '@nestjs/mongoose';

import { Injectable } from '@nestjs/common';
import { IProduct, Product } from 'src/Models/Product.model';
import { Category } from 'src/Models/Category.model';
import { SubCategory } from 'src/Models/SubCategory.model';
import { Brand } from 'src/Models/Brand.model';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';

@Injectable()
export class ProductRepo extends DBRepo<IProduct> {
  constructor(
    @InjectModel(Product.name) private ProductModel: Model<Product>,
    @InjectModel(Category.name) private CategoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private SubCategoryModel: Model<SubCategory>,
    @InjectModel(Brand.name) private BrandModel: Model<Brand>,
  ) {
    super(ProductModel);
  }

  async checkProductExists(id: Types.ObjectId): Promise<boolean> {
    return (await this.findOne({ filter: { _id: id } })) != null;
  }
  async checkCategoryExists(id: Types.ObjectId) {
    return await this.CategoryModel.findById(id);
  }
  async checkSubCategoryExists(
    id: Types.ObjectId,
    categoryId?: Types.ObjectId,
  ) {
    const filter: {
      _id: Types.ObjectId;
      categoryId?: Types.ObjectId;
    } = {
      _id: id,
    };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    return await this.SubCategoryModel.findOne({ filter });
  }
  async checkBrandExists(id: Types.ObjectId) {
    return await this.BrandModel.findById(id);
  }

  calcPriceAfterDiscount(
    discountType: DiscountTypeEnum,
    price: number,
    discountValue: number,
  ) {
    let priceAfterDiscount: number;
    switch (discountType) {
      case DiscountTypeEnum.Static:
        priceAfterDiscount = price - discountValue;
        break;
      case DiscountTypeEnum.Percentage:
        priceAfterDiscount = price - (price * discountValue) / 100;
        break;
    }
    return priceAfterDiscount;
  }
}
