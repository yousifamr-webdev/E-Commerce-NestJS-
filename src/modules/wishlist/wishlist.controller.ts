import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { AddProductToWishlistDto } from './dto/wishlist.add.dto';
import { WishlistService } from './wishlist.service';
import { GetWishlistsDto } from './dto/wishlist.find.dto';
import { RemoveProductFromWishlistDto } from './dto/wishlist.remove.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Auth({})
  @Post()
  async AddProductToWishlist(
    @User() user: UserDocument,
    @Body() data: AddProductToWishlistDto,
  ) {
    const result = await this.wishlistService.addProductToWishlist(user, data);
    return result;
  }

  @Auth({})
  @Get()
  async GetWishlist(@User() user: UserDocument, @Body() data: GetWishlistsDto) {
    const result = await this.wishlistService.getWishlist(user, data);
    return result;
  }

  @Auth({})
  @Delete()
  async RemoveProductFromWishlist(
    @User() user: UserDocument,
    @Body() data: RemoveProductFromWishlistDto,
  ) {
    const result = await this.wishlistService.removeProductFromWishlist(
      user,
      data,
    );
    return result;
  }
}
