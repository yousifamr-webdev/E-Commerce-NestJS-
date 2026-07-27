import type { Model, Types } from 'mongoose';
import DBRepo from './db.repo.js';
import { InjectModel } from '@nestjs/mongoose';

import { Injectable } from '@nestjs/common';
import { User } from 'src/Models/User.model';

@Injectable()
export class UserRepo extends DBRepo<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }

  async checkUserExists(id: Types.ObjectId): Promise<boolean> {
    return (await this.findOne({ filter: { _id: id } })) != null;
  }
}
