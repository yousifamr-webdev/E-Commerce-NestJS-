import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICategory } from 'src/Models/Category.model';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Partial<ICategory>,
  ) {
    const result = await this.categoryService.createCategory(file, body);
    return result;
  }

  @Patch('/:categoryId')
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Partial<ICategory>,
  ) {
    const result = await this.categoryService.updateCategory(categoryId, file, body);
    return result;
  }
}
