import { Module } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { addressModel } from 'src/Models/Address.model';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [addressModel],
  providers: [AddressService, S3BucketService],
  controllers: [AddressController],
})
export class AddressModule {}
