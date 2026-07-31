import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { CartProduct } from 'src/Models/Cart.model';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AddProductToCartDto } from './dto/cart.create.dto';
import { UpdateCartDto } from './dto/cart.update.dto';
import { RoleEnum } from 'src/common/enum/user.enums';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth({})
  @Post()
  async AddProductToCart(
    @User() user: UserDocument,
    @Body() data: AddProductToCartDto,
  ) {
    const result = await this.cartService.addProductToCart(user._id, data);
    return result;
  }

  @Auth({})
  @Get('/:cartId')
  async GetCart(@User() user: UserDocument, @Param('cartId') cartId: string) {
    const result = await this.cartService.getCart(user, cartId);
    return result;
  }

  @Auth({})
  @Patch('/:cartId')
  async UpdateCart(
    @User() user: UserDocument,
    @Param('cartId') cartId: string,
    @Body() data: UpdateCartDto,
  ) {
    const result = await this.cartService.updateCart(user, cartId, data);
    return result;
  }

  @Auth({})
  @Delete('/:cartId/product/:productId')
  async RemoveProductFromCart(
    @Param('cartId') cartId: Types.ObjectId,
    @Param('productId') productId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.cartService.removeProductFromCart(
      cartId,
      productId,
      user,
    );
    return result;
  }

  @Auth({})
  @Delete('/:cartId')
  async ClearCart(
    @Param('cartId') cartId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.cartService.clearCart(cartId, user);
    return result;
  }
}
