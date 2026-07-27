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

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private _tokenService: TokenService,
    private _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req!: IRequestAuth;
    let user!: UserDocument;
    const contextType = context.getType();
    switch (contextType) {
      case 'http':
        req = context.switchToHttp().getRequest();
        user = req.user;
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
