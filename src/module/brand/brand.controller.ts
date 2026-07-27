import { Body, Controller, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IBrand } from 'src/Models/Brand.model';


@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {
  }

  @Post()
    @UseInterceptors(FileInterceptor('image'))
    async createBrand(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: Partial<IBrand>,
    ) {
      const result = await this.brandService.createBrand(file, body);
      return result;
    }
  
    @Patch('/:id')
    @UseInterceptors(FileInterceptor('image'))
    async updateBrand(
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
      @Body() body: Partial<IBrand>,
    ) {
      const result = await this.brandService.updateBrand(id, file, body);
      return result;
    }
}
