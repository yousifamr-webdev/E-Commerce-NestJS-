import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { RedisService } from 'src/common/services/redis.service';
import { S3BucketService } from 'src/common/services/s3.service';
import { UserDocument } from 'src/Models/User.model';
import { UserRepo } from 'src/Repo/user.repo';

@Injectable()
export class UserService {
  constructor(
    private _s3BucketService: S3BucketService,
    private readonly _redisService: RedisService,
    private readonly _userRepo: UserRepo,
  ) {}

  public async logOut(bodyData, user:UserDocument, tokenPayload:JwtPayload) {
    const userId = user._id as string | Types.ObjectId;
    const tokenData = tokenPayload;
    const logoutOptions = bodyData.logoutOptions;

    if (logoutOptions === 'all') {
      await this._userRepo.updateOne({
        filter: { _id: userId },
        update: { changeCreditTime: new Date() },
      });
    } else {
      await this._redisService.set({
        key: this._redisService.blackListTokenKey({
          userId: userId as string,
          tokenId: tokenData.jti as string,
        }),
        value: tokenData.jti as string | number,
        exValue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat!),
      });
    }

    return { msg: 'Logout Successful.' };
  }

  async uploadProfilePic(bodyData: any, user: UserDocument) {
    const { key, url } =
      await this._s3BucketService.createPreSignedUploadFileUrl({
        originalname: bodyData.originalname,
        contentType: bodyData.contentType,
        path: `user/${user._id}/profilePic`,
      });

    if (user.profilePic) {
      await this._s3BucketService.deleteFile(user.profilePic);
    }

    return { key, url };
  }

  async uploadCoverPics(files: Express.Multer.File[], user: UserDocument) {
    const keys = await this._s3BucketService.uploadFiles({
      files,
      path: `user/${user._id}/coverPics`,
    });

    if (user.coverPics.length) {
      Promise.all(
        user.coverPics.map((coverPic) => {
          return this._s3BucketService.deleteFile(coverPic);
        }),
      );
    }

    user.coverPics = keys;
    await user.save();

    return keys;
  }

  async deleteUser(user: UserDocument) {
    const deleteUser = await user.deleteOne();

    if (deleteUser.deletedCount !== 1) {
      return new BadRequestException('Failed to delete user.');
    }

    const response = await this._s3BucketService.listFolderKeys(
      `user/${user._id}`,
    );
    const Keys = response.Contents?.map((file) => {
      return { Key: file.Key };
    });

    await this._s3BucketService.deleteFiles(Keys as { Key: string }[]);
  }

  async deleteProfilePic(user: UserDocument) {
    if (user.profilePic) {
      await this._s3BucketService.deleteFile(user.profilePic);
    }

    await this._userRepo.updateOne({
      filter: { _id: user._id },
      update: { $unset: { profilePic: 1 } },
    });

    return { msg: 'Your profile picture was deleted successfully.' };
  }

  async updateCoverPics(
    bodyData: any,
    user: UserDocument,
    coverPics?: Express.Multer.File[],
  ) {
    const keys = coverPics
      ? await this._s3BucketService.uploadFiles({
          files: coverPics,
          path: `user/${user._id}/coverPics`,
        })
      : [];

    const userAfter = await this._userRepo.findOneAndUpdate({
      filter: { _id: user._id },
      update: [
        {
          $set: {
            coverPics: {
              $setUnion: [
                {
                  $setDifference: ['$coverPics', bodyData.removePics || []],
                },
                keys || [],
              ],
            },
          },
        },
      ],
      options: {
        updatePipeline: true,
        returnDocument: 'after',
      },
    });

    if (bodyData.removePics?.length) {
      Promise.all(
        bodyData.removePics.map((coverPic: string) => {
          return this._s3BucketService.deleteFile(coverPic);
        }),
      );
    }

    return userAfter?.coverPics;
  }
}
