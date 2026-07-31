import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { wishlistModel } from 'src/Models/Wishlist.model';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [wishlistModel],
  providers: [WishlistService, S3BucketService],
  controllers: [WishlistController],
})
export class WishlistModule {}
