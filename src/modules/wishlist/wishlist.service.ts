import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { UserDocument } from 'src/Models/User.model';
import { Wishlist } from 'src/Models/Wishlist.model';
import { AddProductToWishlistDto } from './dto/wishlist.add.dto';
import { GetWishlistsDto } from './dto/wishlist.find.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private readonly wishlistModel: Model<Wishlist>,
    private readonly s3Service: S3BucketService,
  ) {}

  async addProductToWishlist(
    user: UserDocument,
    data: AddProductToWishlistDto,
  ) {
    const wishlist = await this.wishlistModel.findOne({ userId: user._id });

    if (wishlist) {
      const isProductExist = wishlist.products.some(
        (product) => product.productId.toString() === data.productId.toString(),
      );

      if (isProductExist) {
        throw new ConflictException('Product is already in wishlist');
      } else {
        wishlist.products.push({ productId: data.productId });
        await wishlist.save();
        return {
          message: `Product was added to ${user.userName}'s wishlist successfully`,
          wishlist,
        };
      }
    }

    const newWishlist = await this.wishlistModel.create({
      userId: user._id,
      products: [
        {
          productId: data.productId,
        },
      ],
    });

    return {
      message: `Product was added to ${user.userName}'s wishlist successfully`,
      wishlist: newWishlist,
    };
  }

  async getWishlist(user: UserDocument, data: GetWishlistsDto) {
    const wishlist = await this.wishlistModel.findOne({
      userId: user._id,
      _id: data.wishlistId,
    });

    if (!wishlist) {
      throw new NotFoundException('Failed to retrieve wishlist');
    }

    return {
      message: 'Wishlist retrieved successfully',
      wishlist,
    };
  }

  async removeProductFromWishlist(user: UserDocument, data: any) {
    const wishlist = await this.wishlistModel.findOne({
      userId: user._id,
      _id: data.wishlistId,
    });

    if (!wishlist) {
      throw new NotFoundException('Failed to retrieve wishlist');
    }

    const products = wishlist.products.filter(
      (product) => product.productId !== data.productId,
    );

    wishlist.products = products;

    await wishlist.save();

    return {
      message: 'Product was removed from wishlist',
      wishlist,
    };
  }
}
