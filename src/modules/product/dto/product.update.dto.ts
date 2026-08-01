import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './product.create.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  deletedImages?: string[];
}
