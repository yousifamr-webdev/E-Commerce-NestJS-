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

import { SubCategoryService } from './subcategory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ISubCategory } from 'src/Models/SubCategory.model';
import { CreateSubcategoryDto } from './dto/subcategory.create.dto';
import { UpdateSubcategoryDto } from './dto/subcategory.update.dto';
import { FilterSubcategoriessDto } from './dto/subcategory.find.dto';

@Controller('subcategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createSubcategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateSubcategoryDto,
  ) {
    const result = await this.subCategoryService.createSubcategory(file, data);
    return result;
  }

  @Get()
  async findAllSubcategories(@Query() query: FilterSubcategoriessDto) {
    const result = await this.subCategoryService.findAllSubcategories(query);
    return result;
  }

  @Get('/:id')
  async findSubcategoryById(@Param('id') id: string) {
    const result = await this.subCategoryService.findSubcategoryById(id);
    return result;
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateSubcategory(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateSubcategoryDto,
  ) {
    const result = await this.subCategoryService.updateSubcategory(
      id,
      file,
      data,
    );
    return result;
  }

  @Delete('/:id')
  async deleteSubcategory(@Param('id') id: string) {
    const result = await this.subCategoryService.deleteSubcategory(id);
    return result;
  }
}
