import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/product.create.dto';
import { S3BucketService } from 'src/common/services/s3.service';
import { UpdateProductDto } from './dto/product.update.dto';
import { Types } from 'mongoose';
import { GetAllProductsDto } from './dto/product.find.dto';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enum/user.enums';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly s3Service: S3BucketService,
  ) {}

  @Auth({ roles: [RoleEnum.Admin] })
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

  @Auth({ roles: [RoleEnum.Admin] })
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

  @Get('/all')
  async getAllProducts(@Query() query: GetAllProductsDto) {
    return await this.productService.getAllProducts(query);
  }

  @Get('/:productId')
  async getProductById(@Param('productId') productId: Types.ObjectId | string) {
    return await this.productService.getProductById(productId);
  }
}
