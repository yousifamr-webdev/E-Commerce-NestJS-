import { Body, Controller, Post } from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { CreateAddressDto } from './dto/address.create.dto';

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
    return result
  }
}
