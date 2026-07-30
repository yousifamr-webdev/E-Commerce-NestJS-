import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { orderModel } from 'src/Models/Order.model';
import { productModel } from 'src/Models/Product.model';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { cartModel } from 'src/Models/Cart.model';
import { StripeService } from 'src/common/services/stripe.service';

@Module({
  imports: [orderModel,productModel,cartModel],
  providers: [OrderService, S3BucketService,StripeService],
  controllers: [OrderController],
})
export class OrderModule {}
