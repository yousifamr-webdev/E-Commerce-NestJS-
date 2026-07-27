import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from './redis.service';
import { UserRepo } from 'src/Repo/user.repo';
import { RoleEnum } from 'src/common/enum/user.enums';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { TokenEnum } from 'src/common/enum/token.enums';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  private TOKEN_SIGNATURE_User_ACCESS: string;
  private TOKEN_SIGNATURE_User_REFRESH: string;
  private TOKEN_SIGNATURE_Admin_ACCESS: string;
  private TOKEN_SIGNATURE_Admin_REFRESH: string;
  constructor(
    private _redisService: RedisService,
    private _userRepo: UserRepo,
    private _configService: ConfigService,
    private _jwtService: JwtService,
  ) {
    this.TOKEN_SIGNATURE_User_ACCESS = _configService.get<string>(
      'TOKEN_SIGNATURE_User_ACCESS',
    )!;
    this.TOKEN_SIGNATURE_User_REFRESH = _configService.get<string>(
      'TOKEN_SIGNATURE_User_REFRESH',
    )!;
    this.TOKEN_SIGNATURE_Admin_ACCESS = _configService.get<string>(
      'TOKEN_SIGNATURE_Admin_ACCESS',
    )!;
    this.TOKEN_SIGNATURE_Admin_REFRESH = _configService.get<string>(
      'TOKEN_SIGNATURE_Admin_REFRESH',
    )!;
  }
  getSignature = (role = RoleEnum.User) => {
    let accessSignature = '';
    let refreshSignature = '';
    switch (role) {
      case RoleEnum.User:
        accessSignature = this.TOKEN_SIGNATURE_User_ACCESS;
        refreshSignature = this.TOKEN_SIGNATURE_User_REFRESH;
        break;
      case RoleEnum.Admin:
        accessSignature = this.TOKEN_SIGNATURE_Admin_ACCESS;
        refreshSignature = this.TOKEN_SIGNATURE_Admin_REFRESH;
        break;
    }

    return { accessSignature, refreshSignature };
  };

  generateToken = ({
    payload = {},
    signature,
    options = {},
  }: {
    payload?: object;
    signature: string;
    options?: JwtSignOptions;
  }) => {
    return this._jwtService.sign(payload, { secret: signature, ...options });
  };
  verifyToken = ({
    token,
    signature,
  }: {
    token: string;
    signature: string;
  }) => {
    return this._jwtService.verify(token, { secret: signature });
  };
  decodeToken = (token: string) => {
    return this._jwtService.decode(token);
  };

  generateAccessAndRefreshTokens = ({
    role,
    sub,
  }: {
    role: RoleEnum;
    sub: string;
  }) => {
    const { accessSignature, refreshSignature } = this.getSignature(role);

    const tokenId = randomUUID();

    const access_token = this.generateToken({
      signature: accessSignature,
      options: {
        subject: sub.toString(),
        audience: [role.toString(), TokenEnum.Access.toString()],
        expiresIn: 60 * 15,
        jwtid: tokenId,
      },
    });

    const refresh_token = this.generateToken({
      signature: refreshSignature,
      options: {
        subject: sub.toString(),
        audience: [role.toString(), TokenEnum.Refresh.toString()],
        expiresIn: '1y',
        jwtid: tokenId,
      },
    });

    return { access_token, refresh_token };
  };

  async checkToken(token: string, expectedTokenType = TokenEnum.Access) {
    const decodedToken = this.decodeToken(token) as JwtPayload;

    if (!decodedToken || !decodedToken.aud) {
      throw new UnauthorizedException('Invalid Token.');
    }

    const [userRole, tokenType] = decodedToken.aud;

    if ((Number(tokenType) as TokenEnum) !== expectedTokenType) {
      throw new BadRequestException('Invalid token type.');
    }

    const { accessSignature, refreshSignature } = this.getSignature(
      Number(userRole) as RoleEnum,
    );

    const verifiedToken = this.verifyToken({
      token: token,
      signature:
        expectedTokenType == TokenEnum.Access
          ? accessSignature
          : refreshSignature,
    }) as JwtPayload;

    if (
      await this._redisService.get(
        this._redisService.blackListTokenKey({
          userId: verifiedToken.sub as string,
          tokenId: verifiedToken.jti as string,
        }),
      )
    ) {
      throw new UnauthorizedException('You need to login again.');
    }

    const user = await this._userRepo.findById({
      id: verifiedToken.sub as string,
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (new Date(verifiedToken.iat! * 1000) < user.changeCreditTime) {
      throw new UnauthorizedException('You need to login.');
    }

    return {
      user,
      verifiedToken,
    };
  }
}
