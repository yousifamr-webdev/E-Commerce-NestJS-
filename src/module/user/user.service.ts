import { Injectable } from '@nestjs/common';
import { S3BucketService } from 'src/common/services/s3.service';
import { UserDocument } from 'src/Models/User.model';

@Injectable()
export class UserService {
  constructor(private _s3BucketService: S3BucketService) {}

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
}
