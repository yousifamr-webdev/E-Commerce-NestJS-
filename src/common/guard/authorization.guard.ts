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
import { UserDocument } from 'src/Models/User.model';
import { RoleEnum } from '../enum/user.enums';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private _tokenService: TokenService,
    private _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req!: IRequestAuth;
    let user!: UserDocument;
    let tokenPayload!: JwtPayload
    const contextType = context.getType();
    switch (contextType) {
      case 'http':
        req = context.switchToHttp().getRequest();
        user = req.user;
        tokenPayload =req.tokenPayload
        break;

      default:
        break;
    }

    const roles: RoleEnum[] = this._reflector.getAllAndOverride('Roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    return roles.includes(user.role);
  }
}
