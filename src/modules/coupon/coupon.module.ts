import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { couponModel } from 'src/Models/Coupon.model';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { cartModel } from 'src/Models/Cart.model';

@Module({
  imports: [couponModel,cartModel],
  providers: [CouponService, S3BucketService],
  controllers: [CouponController],
})
export class CouponModule {}
