import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './product.create.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsArray()
  deletedImages?: string[];
}
