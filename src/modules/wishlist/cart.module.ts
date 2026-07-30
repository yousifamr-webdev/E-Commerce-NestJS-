import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { cartModel } from 'src/Models/Cart.model';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [cartModel],
  providers: [CartService, S3BucketService],
  controllers: [CartController],
})
export class CartModule {}
