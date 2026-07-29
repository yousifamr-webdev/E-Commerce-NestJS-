import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestAuth } from '../interface/request.interface';

export const TokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let req!: IRequestAuth;

    const contextType = context.getType();
    switch (contextType) {
      case 'http':
        req = context.switchToHttp().getRequest();
        break;

      default:
        break;
    }

    return req.tokenPayload;
  },
);
