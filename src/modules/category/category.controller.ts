import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICategory } from 'src/Models/Category.model';
import { CreateCategoryDto } from './dto/category.create.dto';
import { FilterCategoriesDto } from './dto/category.find.dto';
import { UpdateCategoryDto } from './dto/category.update.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCategoryDto,
  ) {
    const result = await this.categoryService.createCategory(file, body);
    return result;
  }

  @Get()
  async findAllCategories(@Query() query: FilterCategoriesDto) {
    const result = await this.categoryService.findAllCategories(query);
    return result;
  }

  @Get('/:id')
  async findCategoryById(@Param('id') id: string) {
    const result = await this.categoryService.findCategoryById(id);
    return result;
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateCategoryDto,
  ) {
    const result = await this.categoryService.updateCategory(id, file, data);
    return result;
  }

  @Delete('/:id')
  async deleteCategory(@Param('id') id: string) {
    const result = await this.categoryService.deleteCategory(id);
    return result;
  }
}
