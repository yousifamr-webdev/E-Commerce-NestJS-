import { Injectable } from '@nestjs/common';
import { S3BucketService } from './common/services/s3.service';

@Injectable()
export class AppService {
  constructor(private _s3BucketService: S3BucketService) {}
  async getFile(path: any) {
    const Key = path.join('/');

    const result = await this._s3BucketService.getFile(Key);
    return result;
  }

  async preSignedGetFile(path: any, filename: string, download: string) {
    const Key = path.join('/');
    const result = await this._s3BucketService.createPreSignedGetFile({
      Key,
      filename: (filename as string) || (path[path.length - 1] as string),
      download: download as string,
    });
    return result;
  }
}
