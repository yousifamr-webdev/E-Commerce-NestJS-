import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STRIPE_SECRET_KEY } from 'src/config/config.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  createCheckoutSession = async ({
    customer_email,
    metadata,
    line_items,
    discounts,
  }: {
    customer_email: string;
    metadata: {};
    line_items: [];
    discounts: [];
  }) => {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email,
      metadata,
      success_url: 'http://localhost:3000/order/success',
      cancel_url: 'http://localhost:3000/order/cancel',
      line_items,
      discounts,
    });
    return session;
  };

  createCoupon = async (percent_off: number) => {
    const coupon = await this.stripe.coupons.create({
      duration: 'repeating',
      duration_in_months: 2,
      percent_off,
    });
    return coupon;
  };

  createRefund = async (payment_intent) => {
    return await this.stripe.refunds.create({
      payment_intent,
      reason: 'requested_by_customer',
    });
  };
}
