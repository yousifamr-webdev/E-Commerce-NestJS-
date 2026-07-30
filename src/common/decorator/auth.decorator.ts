import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { TokenEnum } from '../enum/token.enums';
import { RoleEnum } from '../enum/user.enums';
import { AuthenticationGuard } from '../guard/authentication.guard';
import { AuthorizationGuard } from '../guard/authorization.guard';

export function Auth({
  expectedTokenType = TokenEnum.Access,
  roles= [RoleEnum.User,RoleEnum.Admin],
}: {
  expectedTokenType?: TokenEnum;
  roles?: RoleEnum[];
}) {
  return applyDecorators(
    SetMetadata('expectedTokenType', expectedTokenType),
    SetMetadata('Roles', roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
