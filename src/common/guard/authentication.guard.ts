import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { IRequestAuth } from '../interface/request.interface';
import { Reflector } from '@nestjs/core';
import { TokenEnum } from '../enum/token.enums';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private _tokenService: TokenService,
    private _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let authorization!: string;
    let req!: IRequestAuth;
    const contextType = context.getType();
    switch (contextType) {
      case 'http':
        req = context.switchToHttp().getRequest();
        authorization = req.headers.authorization!;
        break;

      default:
        break;
    }

    if (!authorization) {
      throw new UnauthorizedException('You need to login first.');
    }

    const [BearerKey, token] = authorization.split(' ');

    if (BearerKey !== 'Bearer') {
      throw new BadRequestException('Invalid authentication key.');
    }

    if (!token) {
      throw new UnauthorizedException('You need to login first.');
    }

    const expectedTokenType = this._reflector.getAllAndOverride(
      'expectedTokenType',
      [context.getHandler(), context.getClass()],
    ) 

    const { user, verifiedToken } = await this._tokenService.checkToken(
      token,
      expectedTokenType,
    );

    req.user = user;
    req.tokenPayload = verifiedToken;
    return true;
  }
}
