import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IBrand } from 'src/Models/Brand.model';
import { FilterBrandsDto } from './dto/brand.find.dto';
import { CreateBrandDto } from './dto/brand.create.dto';
import { UpdateBrandDto } from './dto/brand.update.dto';


@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async createBrand(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateBrandDto,
  ) {
    const result = await this.brandService.createBrand(file, data);
    return result;
  }

  @Get()
  async findAllBrands(@Query() query: FilterBrandsDto) {
    const result = await this.brandService.findAllBrands(query);
    return result;
  }

  @Get('/:id')
  async findBrandById(@Param('id') id: string) {
    const result = await this.brandService.findBrandById(id);
    return result;
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateBrand(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateBrandDto,
  ) {
    const result = await this.brandService.updateBrand(id, file, data);
    return result;
  }

  @Delete('/:id')
  async deleteBrand(@Param('id') id: string) {
    const result = await this.brandService.deleteBrand(id);
    return result;
  }
}
