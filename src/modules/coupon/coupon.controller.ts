import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { Auth } from 'src/common/decorator/auth.decorator';
import { CreateCouponDto } from './dto/coupon.create.dto';
import { UpdateCouponDto } from './dto/coupon.update.dto';
import { Types } from 'mongoose';
import { RoleEnum } from 'src/common/enum/user.enums';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth({})
  @Post()
  async CreateCoupon(
    @User() user: UserDocument,
    @Body() data: CreateCouponDto,
  ) {
    const result = await this.couponService.CreateCoupon(user, data);
    return result;
  }

  @Auth({roles:[RoleEnum.Admin]})
  @Get()
  async GetAllCoupons() {
    const result = await this.couponService.GetAllCoupons();
    return result;
  }

  @Auth({})
  @Patch('/:couponId')
  async UpdateCoupon(
    @Param('couponId') couponId: Types.ObjectId,
    @Body() data: UpdateCouponDto,
  ) {
    const result = await this.couponService.UpdateCoupon(couponId, data);
    return result;
  }

  @Auth({})
  @Delete('/:couponId')
  async DeleteCoupon(
    @Param('couponId') couponId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.couponService.DeleteCoupon(couponId, user);
    return result;
  }

  @Auth({})
  @Patch('/:couponId/apply/:cartId')
  async ApplyCouponToCart(
    @Param('cartId') cartId: string,
    @Param('couponId') couponId: string,
    @User() user: UserDocument,
  ) {
    const result = await this.couponService.ApplyCouponToCart(
      cartId,
      couponId,
      user,
    );
    return result;
  }

  @Auth({})
  @Delete('/remove/:cartId')
  async RemoveCouponFromCart(
    @Param('cartId') cartId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.couponService.RemoveCouponFromCart(cartId, user);
    return result;
  }
}
