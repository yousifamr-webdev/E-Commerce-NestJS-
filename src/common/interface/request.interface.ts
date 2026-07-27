import type { Request } from 'express';
import { UserDocument } from 'src/Models/User.model';
import { JwtPayload } from 'jsonwebtoken';

export interface IRequestAuth extends Request {
  user: UserDocument;
  tokenPayload: JwtPayload;
}
