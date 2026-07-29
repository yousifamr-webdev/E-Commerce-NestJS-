import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { brandModel } from 'src/Models/Brand.model';
import { S3BucketService } from 'src/common/services/s3.service';

@Module({
  imports: [brandModel],
  providers: [BrandService, S3BucketService],
  controllers: [BrandController],
})
export class BrandModule {}
