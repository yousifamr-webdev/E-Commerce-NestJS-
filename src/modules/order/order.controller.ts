import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { User } from 'src/common/decorator/user.decorator';
import type { UserDocument } from 'src/Models/User.model';
import { Auth } from 'src/common/decorator/auth.decorator';
import { CreateOrderDto } from './dto/order.create.dto';
import { UpdateOrderDto } from './dto/order.update.dto';
import { Types } from 'mongoose';
import { RoleEnum } from 'src/common/enum/user.enums';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth({})
  @Post('/cash')
  async CreateCashOrder(
    @User() user: UserDocument,
    @Body() data: CreateOrderDto,
  ) {
    const result = await this.orderService.CreateCashOrder(user, data);
    return result;
  }

  @Auth({})
  @Post('/card')
  async CreateCardOrder(
    @User() user: UserDocument,
    @Body() data: CreateOrderDto,
  ) {
    const result = await this.orderService.CreateCardOrder(user, data);
    return result;
  }

  @Auth({ roles: [RoleEnum.Admin] })
  @Get()
  async GetAllOrders() {
    const result = await this.orderService.GetAllOrders();
    return result;
  }

  @Auth({})
  @Get('/:orderId')
  async GetOrder(
    @Param('orderId') orderId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.orderService.GetOrder(orderId, user);
    return result;
  }

  @Auth({})
  @Patch('/:orderId')
  async UpdateOrder(
    @Param('orderId') orderId: Types.ObjectId,
    @Body() data: UpdateOrderDto,
    @User() user: UserDocument,
  ) {
    const result = await this.orderService.UpdateOrder(orderId, data, user);
    return result;
  }

  @Auth({})
  @Delete('/:orderId')
  async DeleteOrder(
    @Param('orderId') orderId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    const result = await this.orderService.DeleteOrder(orderId, user);
    return result;
  }

  @Post('/paid')
  async UpdateCardPaymentStatus(@Body() data: any) {
    const result = await this.orderService.UpdateCardPaymentStatus(data);
    return result;
  }
  @Auth({})
  @Post('/:orderId/refund')
  async RefundCardOrder(@Body() data: any) {
    const result = await this.orderService.RefundCardOrder(data);
    return result;
  }
}
