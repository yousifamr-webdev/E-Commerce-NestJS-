import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from 'src/Models/Cart.model';
import { Coupon } from 'src/Models/Coupon.model';
import { UserDocument } from 'src/Models/User.model';
import { DiscountTypeEnum } from 'src/common/enum/product.enum';
import { CreateCouponDto } from './dto/coupon.create.dto';
import { UpdateCouponDto } from './dto/coupon.update.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) {}

  async CreateCoupon(user: UserDocument, data: CreateCouponDto) {
    if (data.isActive) {
      if (!data.deactivationDate) {
        throw new BadRequestException(
          'Deactivation date is required when coupon is active.',
        );
      }
      data.activationDate = new Date();
    }

    const isCouponExist = await this.couponModel.exists({ code: data.code });

    if (isCouponExist) {
      throw new NotFoundException('Coupon already exists.');
    }

    const coupon = await this.couponModel.create({
      ...data,
      createdBy: user._id,
    });

    return {
      message: 'Coupon created successfully',
      status: HttpStatus.CREATED,
      coupon,
    };
  }

  async UpdateCoupon(couponId: string | Types.ObjectId, data: UpdateCouponDto) {
    if (data.isActive) {
      if (!data.deactivationDate) {
        throw new BadRequestException(
          'Deactivation date is required when coupon is active.',
        );
      }
      data.activationDate = new Date();
    }

    const coupon = await this.couponModel.findById(couponId);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (coupon.code === data.code && coupon._id !== couponId) {
      throw new ConflictException('Coupon code already exists');
    }

    Object.assign(coupon, data);
    await coupon.save();

    return {
      message: 'Coupon updated successfully',
      status: HttpStatus.OK,
      coupon,
    };
  }

  async DeleteCoupon(couponId: string | Types.ObjectId, user: UserDocument) {
    const coupon = await this.couponModel.findById(couponId);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    coupon.deletedAt = new Date();
    coupon.deletedBy = user._id as Types.ObjectId;
    coupon.isActive = false;

    await coupon.save();

    return {
      message: 'Coupon deleted successfully',
      status: HttpStatus.OK,
      coupon,
    };
  }

  async GetAllCoupons() {
    const coupons = await this.couponModel.find();
    if (!coupons) {
      throw new NotFoundException('No coupons were found');
    }

    return {
      message: 'Coupons retrieved successfully',
      status: HttpStatus.OK,
      coupons,
    };
  }

  async ApplyCouponToCart(
    cartId: string | Types.ObjectId,
    couponId: string | Types.ObjectId,
    user: UserDocument,
  ) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const coupon = await this.couponModel.findOne({
      _id: couponId,
      isActive: true,
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const currentDate = new Date();

    if (coupon.activationDate && currentDate < coupon.activationDate) {
      throw new BadRequestException('Coupon is not yet active');
    }

    if (coupon.deactivationDate && currentDate > coupon.deactivationDate) {
      throw new BadRequestException('Coupon is expired');
    }

    cart.coupon = coupon._id as Types.ObjectId;

    const currentTotal = cart.products.reduce(
      (total, product) => total + product.quantity * product.unitPrice,
      0,
    );

    if (coupon.discountDetials.disocuntType === DiscountTypeEnum.Percentage) {
      cart.totalPriceAfterDiscount =
        currentTotal -
        (currentTotal * coupon.discountDetials.discountValue) / 100;
    } else {
      cart.totalPriceAfterDiscount =
        currentTotal - coupon.discountDetials.discountValue;
    }

    if (cart.totalPriceAfterDiscount < 0) {
      cart.totalPriceAfterDiscount = 0;
    }

    await cart.save();

    return {
      message: 'Coupon applied to cart',
      status: HttpStatus.OK,
      cart,
    };
  }

  async RemoveCouponFromCart(
    cartId: string | Types.ObjectId,
    user: UserDocument,
  ) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.coupon = undefined;
    cart.totalPriceAfterDiscount = 0;

    await cart.save();

    return {
      message: 'Coupon removed from cart',
      status: HttpStatus.OK,
      cart,
    };
  }
}
