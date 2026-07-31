import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from 'src/Models/Order.model';
import { Cart } from 'src/Models/Cart.model';
import { UserDocument } from 'src/Models/User.model';
import { CreateOrderDto } from './dto/order.create.dto';
import { UpdateOrderDto } from './dto/order.update.dto';
import {
  DeliveryStatusEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from 'src/common/enum/order.enums';
import { StripeService } from 'src/common/services/stripe.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly stripeService: StripeService,
  ) {}

  async createCashOrder(user: UserDocument, data: CreateOrderDto) {
    const cart = await this.cartModel.findOne({
      _id: data.cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.products || cart.products.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const orderPrice = cart.coupon
      ? cart.totalPriceAfterDiscount
      : cart.totalPrice;

    const order = await this.orderModel.create({
      userId: user._id,
      cart: cart._id,
      totalPrice: orderPrice,
      coupon: cart.coupon,
      phone: data.phone,
      address: data.address,
      deliveryStatus: DeliveryStatusEnum.ProcessingOrder,
      paymentDetails: {
        paymentStatus: PaymentStatusEnum.Pending,
        paymentType: PaymentTypeEnum.COD,
      },
    });

    return {
      message: 'Cash order created successfully',
      status: HttpStatus.CREATED,
      order,
    };
  }

  async createCardOrder(user: UserDocument, data: CreateOrderDto) {
    const cart = await this.cartModel
      .findOne({
        _id: data.cartId,
        userId: user._id,
      })
      .populate('products.productId');

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.products || cart.products.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const orderPrice = cart.coupon
      ? cart.totalPriceAfterDiscount
      : cart.totalPrice;

    const order = await this.orderModel.create({
      userId: user._id,
      cart: cart._id,
      totalPrice: orderPrice,
      coupon: cart.coupon,
      phone: data.phone,
      address: data.address,
      deliveryStatus: DeliveryStatusEnum.ProcessingOrder,
      paymentDetails: {
        paymentStatus: PaymentStatusEnum.Pending,
        paymentType: PaymentTypeEnum.Card,
      },
    });

    let coupon: any;
    if (order.coupon) {
      coupon = await this.stripeService.createCoupon(
        order.coupon['discountDetails.discountValue'],
      );
    }

    const line_items = cart.products.map((item: any) => ({
      price_data: {
        currency: 'egp',
        product_data: {
          name: item.productId?.name || 'Product',
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripeService.createCheckoutSession({
      customer_email: (user as any).email,
      metadata: {
        orderId: order._id.toString(),
        cartId: cart._id.toString(),
        userId: user._id.toString(),
      },
      line_items: line_items as any,
      ...(coupon && { discounts: [{ coupon: coupon.id }] }),
    });

    return {
      message: 'Card order created successfully',
      status: HttpStatus.CREATED,
      order,
      sessionUrl: session.url,
    };
  }

  async updateCardPaymentStatus(body: any) {
    const orderId = body.data.object.metadata.orderId;
    const paymentIntent = body.data.object.payment_intent;

   const order = await this.orderModel.findOneAndUpdate(
     { _id: orderId },
     {
       $set: {
         'paymentDetails.paymentStatus': PaymentStatusEnum.Paid,
         paymentIntent,
       },
     },
     { new: true },
   );

    return {
      message: 'Card order updated successfully',
      status: HttpStatus.OK,
      order,
    };
  }

  async refundCardOrder(orderId: Types.ObjectId | string) {
  const order = await this.orderModel.findOneAndUpdate(
    {
      _id: orderId,
      'paymentDetails.paymentStatus': PaymentStatusEnum.Paid,
    },
    {
      $set: {
        'paymentDetails.paymentStatus': PaymentStatusEnum.Refunded,
      },
    },
    {
      new: true,
    },
  );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.stripeService.createRefund(order.paymentIntent);

    return {
      message: 'Order was refunded',
      status: HttpStatus.OK,
      order,
    };
  }

  async getOrder(orderId: string | Types.ObjectId, user: UserDocument) {
    const order = await this.orderModel.findById(orderId).populate('cart');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to view this order.',
      );
    }

    return {
      message: 'Order retrieved successfully',
      status: HttpStatus.OK,
      order,
    };
  }

  async updateOrder(
    orderId: string | Types.ObjectId,
    data: UpdateOrderDto,
    user: UserDocument,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this order.',
      );
    }

    Object.assign(order, data);
    await order.save();

    return {
      message: 'Order updated successfully',
      status: HttpStatus.OK,
      order,
    };
  }

  async deleteOrder(orderId: string | Types.ObjectId, user: UserDocument) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to delete this order.',
      );
    }

    order.deletedAt = new Date();
    order.deletedBy = user._id as Types.ObjectId;

    await order.save();

    return {
      message: 'Order deleted successfully',
      status: HttpStatus.OK,
    };
  }

  async getAllOrders() {
    const orders = await this.orderModel.find().populate('cart');

    if (!orders) {
      throw new NotFoundException('No orders were found');
    }

    return {
      message: 'Orders retrieved successfully',
      status: HttpStatus.OK,
      orders,
    };
  }
}
