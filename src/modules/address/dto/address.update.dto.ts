import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { CreateAddressDto } from './address.create.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
