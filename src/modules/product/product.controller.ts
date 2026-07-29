import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/product.create.dto';
import { S3BucketService } from 'src/common/services/s3.service';
import { UpdateProductDto } from './dto/product.update.dto';
import { Types } from 'mongoose';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly s3Service: S3BucketService,
  ) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('gallery', 5))
  async createProduct(
    @Body() data: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const gallery = await this.s3Service.uploadFiles({
      files,
      path: 'products',
    });

    const result = await this.productService.createProduct(data, gallery);
    return result;
  }

  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('gallery', 5))
  async updateProduct(
    @Param('id') id: Types.ObjectId,
    @Body() data: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let gallery: string[] = [];
    if (files?.length) {
      const gallery = await this.s3Service.uploadFiles({
        files,
        path: 'products',
      });
    }
    const result = await this.productService.updateProduct(id, data, gallery);
    return result;
  }
}
