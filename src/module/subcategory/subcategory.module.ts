import { Module } from "@nestjs/common";
import { SubCategoryService } from "./subcategory.service";
import { SubCategoryController } from "./subcategory.controller";
import { subCategoryModel } from "src/Models/SubCategory.model";
import { S3BucketService } from "src/common/services/s3.service";







@Module({
  imports: [subCategoryModel],
  providers: [SubCategoryService,S3BucketService],
  controllers: [SubCategoryController],
})
export class SubCategoryModule {}