import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { S3BucketService } from './common/services/s3.service';
import { promisify } from 'util';
import { pipeline } from 'stream';
import type { Response } from 'express';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/uploads/*path')
  async getFile(
    @Param('path') path: any,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const result = await this.appService.getFile(path);

    if (query.download == 'true') {
      res.setHeader(
        'content-disposition',
        `attachment; filename=${query.filename || path[path.length - 1]}`,
      );
    }

    const pipelinePromise = promisify(pipeline);

    await pipelinePromise(result.Body as NodeJS.ReadableStream, res);
  }

  @Get('/pre-signed-upload/*path')
  preSignedgetFile(
    @Param('path') path: any,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const result = this.appService.preSignedGetFile(
      path,
      query.filename,
      query.download,
    );

    return result;
  }
}
