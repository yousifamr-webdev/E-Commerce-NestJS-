import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepo } from 'src/Repo/product.repo';
import { productModel } from 'src/Models/Product.model';
import { categoryModel } from 'src/Models/Category.model';
import { subCategoryModel } from 'src/Models/SubCategory.model';
import { brandModel } from 'src/Models/Brand.model';
import { S3BucketService } from 'src/common/services/s3.service';

@Module({
  imports: [productModel, categoryModel, subCategoryModel, brandModel],
  controllers: [ProductController],
  providers: [ProductService, ProductRepo, S3BucketService],
})
export class ProductModule {}
