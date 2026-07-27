import { randomUUID } from 'crypto';
import { StorageApproachEnum } from '../enum/multer.enums';
import { tmpdir } from 'os';
import multer, { FileFilterCallback } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const allowedFileFormats = {
  img: ['image/png', 'image/jpg'],
  video: ['video/mp4'],
  pdf: ['application/pdf'],
};

export function fileFilter(allowedFormat: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!allowedFormat.includes(file.mimetype)) {
      return cb(new BadRequestException('invalid format'), false);
    }
    return cb(null, true);
  };
}

export function multerOptions({
  storageApproach = StorageApproachEnum.Memory,
  allowedFormat = allowedFileFormats.img,
  fileSize = 5,
}: {
  storageApproach?: StorageApproachEnum;
  allowedFormat?: string[];
  fileSize?: number;
}={}): MulterOptions {
  const storage =
    storageApproach == StorageApproachEnum.Memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(req, file, callback) {
            callback(null, tmpdir());
          },
          filename(req, file, callback) {
            callback(null, `${randomUUID()}_${file.originalname}`);
          },
        });

  return {
    storage,
    fileFilter: fileFilter(allowedFormat),
    limits: { fileSize: fileSize * 1024 * 1024 },
  };
}
