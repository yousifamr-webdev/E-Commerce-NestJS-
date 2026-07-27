import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { SubCategoryService } from './subcategory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ISubCategory } from 'src/Models/SubCategory.model';

@Controller('category/:categoryId/subcategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createSubcategory(
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Partial<ISubCategory>,
  ) {
    const result = await this.subCategoryService.createSubcategory(
      categoryId,
      file,
      body,
    );
    return result;
  }

  @Patch('/:subcategoryId')
  @UseInterceptors(FileInterceptor('image'))
  async updateSubcategory(
    @Param('categoryId') categoryId: string,
    @Param('subcategoryId') subcategoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Partial<ISubCategory>,
  ) {
    const result = await this.subCategoryService.updateSubcategory(
      categoryId,
      subcategoryId,
      file,
      body,
    );
    return result;
  }
}
