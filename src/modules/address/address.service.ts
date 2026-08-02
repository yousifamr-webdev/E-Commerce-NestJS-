import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { S3BucketService } from 'src/common/services/s3.service';
import { Address } from 'src/Models/Address.model';
import { UserDocument } from 'src/Models/User.model';
import { CreateAddressDto } from './dto/address.create.dto';
import { UpdateAddressDto } from './dto/address.update.dto';

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

    if (data.isDefault) {
      await this.addressModel.updateMany(
        { user: user._id, isDefault: true },
        { isDefault: false },
      );
    }

    const address = await this.addressModel.create({ user: user._id, ...data });

    return {
      message: 'Address was created successfully',
      address,
    };
  }

  async getUserAddressList(user: UserDocument) {
    const addressList = await this.addressModel.find({ user: user._id });

    return {
      message: 'Address list retrieved successfully',
      addressList,
    };
  }

  async getDefaultUserAddress(user: UserDocument) {
    const address = await this.addressModel.find({
      user: user._id,
      isDefault: true,
    });

    return {
      message: 'Address list retrieved successfully',
      address,
    };
  }

  async updateAddress(
    user: UserDocument,
    addressId: Types.ObjectId | string,
    data: UpdateAddressDto,
  ) {
    if (data.isDefault) {
      await this.addressModel.updateMany(
        { user: user._id, isDefault: true },
        { isDefault: false },
      );
    }

    const address = await this.addressModel.findOneAndUpdate(
      { user: user._id, _id: addressId },
      data,
      { returnDocument: 'after' },
    );

    if (!address) {
      throw new BadRequestException('Unable to update address');
    }
    return {
      message: 'Address was updated successfully',
      address,
    };
  }

  async deleteAddress(user: UserDocument, addressId: Types.ObjectId | string) {
    const address = await this.addressModel.findOne({
      user: user._id,
      _id: addressId,
    });

    if (address?.isDefault) {
      throw new BadRequestException('Cannot delete default address');
    }

    await this.addressModel.deleteOne({
      _id: addressId,
      user: user._id,
      isDefault: false,
    });

    return {
      message: 'Address was deleted successfully',
    };
  }
}
