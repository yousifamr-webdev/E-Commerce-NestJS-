import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { CreateAddressDto } from './dto/address.create.dto';
import { UpdateAddressDto } from './dto/address.update.dto';
import { Types } from 'mongoose';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Auth({})
  @Post()
  async CreateAddress(
    @User() user: UserDocument,
    @Body() data: CreateAddressDto,
  ) {
    const result = await this.addressService.createAddress(user, data);
    return result;
  }

  @Auth({})
  @Get("/all")
  async GetUserAddressList(@User() user: UserDocument) {
    const result = await this.addressService.getUserAddressList(user);
    return result;
  }

  @Auth({})
  @Get('/default')
  async GetDefaultUserAddress(@User() user: UserDocument) {
    const result = await this.addressService.getDefaultUserAddress(user);
    return result;
  }

  @Auth({})
  @Patch('/:addressId')
  async UpdateAddress(
    @User() user: UserDocument,
    @Param('addressId') addressId: Types.ObjectId | string,
    @Body() data: UpdateAddressDto,
  ) {
    const result = await this.addressService.updateAddress(
      user,
      addressId,
      data,
    );
    return result;
  }

  @Auth({})
  @Delete('/:addressId/delete')
  async DeleteAddress(
    @User() user: UserDocument,
    @Param('addressId') addressId: Types.ObjectId | string,
  ) {
    const result = await this.addressService.deleteAddress(user, addressId);
    return result;
  }
}
