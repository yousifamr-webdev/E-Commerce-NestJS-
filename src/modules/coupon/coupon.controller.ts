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
    const result = await this.couponService.createCoupon(user, data);
    return result;
  }

  @Auth({roles:[RoleEnum.Admin]})
  @Get()
  async GetAllCoupons() {
    const result = await this.couponService.getAllCoupons();
    return result;
  }

  @Auth({})
  @Patch('/:couponId')
  async UpdateCoupon(
    @Param('couponId') couponId: Types.ObjectId,
    @Body() data: UpdateCouponDto,
  ) {
    const result = await this.couponService.updateCoupon(couponId, data);
    return result;
  }

  @Auth({})
  @Delete('/:couponId')
  async DeleteCoupon(
    @Param('couponId') couponId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.couponService.deleteCoupon(couponId, user);
    return result;
  }

  @Auth({})
  @Patch('/:couponId/apply/:cartId')
  async ApplyCouponToCart(
    @Param('cartId') cartId: string,
    @Param('couponId') couponId: string,
    @User() user: UserDocument,
  ) {
    const result = await this.couponService.applyCouponToCart(
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
    const result = await this.couponService.removeCouponFromCart(cartId, user);
    return result;
  }
}
