import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { categoryModel } from 'src/Models/Category.model';
import { S3BucketService } from 'src/common/services/s3.service';

@Module({
  imports: [categoryModel],
  providers: [CategoryService, S3BucketService],
  controllers: [CategoryController],
})
export class CategoryModule {}
