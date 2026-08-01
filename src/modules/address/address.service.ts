import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { Address } from 'src/Models/Address.model';
import { UserDocument } from 'src/Models/User.model';
import { CreateAddressDto } from './dto/address.create.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
    private readonly s3Service: S3BucketService,
  ) {}

  async createAddress(user: UserDocument, data: CreateAddressDto) {
    const existingAddress = await this.addressModel.findOne({
      user: user._id,
      alias: data.alias,
    });

    if (existingAddress) {
      throw new ConflictException('Please use a different alias.');
    }

    const address = await this.addressModel.create({ user: user._id, ...data });

    return {
      message: 'Address was created successfully',
      address,
    };
  }
}
