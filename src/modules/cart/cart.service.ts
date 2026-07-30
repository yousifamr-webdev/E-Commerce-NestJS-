import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { Cart } from 'src/Models/Cart.model';
import { Product } from 'src/Models/Product.model';
import { UserDocument } from 'src/Models/User.model';
import { AddProductToCartDto } from './dto/cart.create.dto';
import { UpdateCartDto } from './dto/cart.update.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly s3Service: S3BucketService,
  ) {}

  async AddProductToCart(
    userId: string | Types.ObjectId,
    data: AddProductToCartDto,
  ) {
    const isProductExist = await this.productModel.exists({
      _id: data.product.productId,
    });

    if (!isProductExist) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      const newCart = await this.cartModel.create({
        userId,
        products: [
          {
            productId: data.product.productId,
            quantity: data.product.quantity,
            unitPrice: data.product.unitPrice,
          },
        ],
      });

      return {
        message: 'Product was added to cart.',
        status: HttpStatus.CREATED,
        newCart,
      };
    }

    const existingProduct = cart.products.find(
      (cartProduct) =>
        cartProduct.productId.toString() === data.product.productId.toString(),
    );

    if (existingProduct) {
      existingProduct.quantity += data.product.quantity;
    } else {
      cart.products.push(data.product);
    }

    await cart.save();

    return {
      message: 'Product was added to cart.',
      status: HttpStatus.OK,
      cart,
    };
  }

  async GetCart(user: UserDocument, cartId: string | Types.ObjectId) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return {
      message: 'Cart retrieved successfully',
      status: HttpStatus.OK,
      cart,
    };
  }

  async UpdateCart(
    user: UserDocument,
    cartId: string | Types.ObjectId,
    data: UpdateCartDto,
  ) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const productIds = data.products.map((product) => product.productId);

    const products = await this.productModel.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    cart.products = data.products;

    await cart.save();

    return {
      message: 'Cart updated successfully',
      status: HttpStatus.OK,
      cart,
    };
  }

  async RemoveProductFromCart(
    cartId: string | Types.ObjectId,
    productId: string | Types.ObjectId,
    user: UserDocument,
  ) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.products = cart.products.filter(
      (cartProduct) =>
        cartProduct.productId.toString() !== productId.toString(),
    );

    await cart.save();

    return {
      message: 'Product removed from cart',
      status: HttpStatus.OK,
      cart,
    };
  }

  async ClearCart(cartId: string | Types.ObjectId, user: UserDocument) {
    const cart = await this.cartModel.findOne({
      _id: cartId,
      userId: user._id,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.products = [];

    await cart.save();

    return {
      message: 'Cart cleared successfully',
      status: HttpStatus.OK,
      cart,
    };
  }
}
