import { Module } from '@nestjs/common';
import { SubCategoryService } from './subcategory.service';
import { SubCategoryController } from './subcategory.controller';

import { S3BucketService } from 'src/common/services/s3.service';
import { subCategoryModel } from 'src/Models/SubCategory.model';
import { categoryModel } from 'src/Models/Category.model';


@Module({
  imports: [subCategoryModel, categoryModel],
  controllers: [SubCategoryController],
  providers: [SubCategoryService, S3BucketService],
})
export class SubCategoryModule {}
