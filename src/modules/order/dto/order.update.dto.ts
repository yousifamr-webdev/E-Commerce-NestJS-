import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  DeliveryStatusEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from 'src/common/enum/order.enums';

class UpdatePaymentDetailsDto {
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @IsOptional()
  @IsEnum(PaymentTypeEnum)
  paymentType?: PaymentTypeEnum;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  phone?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(DeliveryStatusEnum)
  deliveryStatus?: DeliveryStatusEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePaymentDetailsDto)
  paymentDetails?: UpdatePaymentDetailsDto;
}
