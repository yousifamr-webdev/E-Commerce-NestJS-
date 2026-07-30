import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { Cart } from 'src/Models/Cart.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly s3Service: S3BucketService,
  ) {}
}
