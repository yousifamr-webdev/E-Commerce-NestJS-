import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export const allowedFileFormats = {
  img: ['image/png', 'image/jpg'],
  video: ['video/mp4'],
  pdf: ['application/pdf'],
};

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  constructor(private _allowedFormats: string[]) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (!this._allowedFormats.includes(value.mimetype)) {
      throw new BadRequestException('Invalid File Type.');
    }
    return true;
  }
}
