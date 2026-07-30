import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { cartModel } from 'src/Models/Cart.model';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { productModel } from 'src/Models/Product.model';

@Module({
  imports: [cartModel,productModel],
  providers: [CartService, S3BucketService],
  controllers: [CartController],
})
export class CartModule {}
