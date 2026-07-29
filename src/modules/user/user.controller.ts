import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import 'multer';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { StorageApproachEnum } from 'src/common/enum/multer.enums';
import {
  allowedFileFormats,
  FileSizeValidationPipe,
} from 'src/common/pipe/fileValidation.pipe';
import { multerOptions } from 'src/common/utils/multer.config';
import type { UserDocument } from 'src/Models/User.model';
import { UserService } from './user.service';
import { TokenPayload } from 'src/common/decorator/tokenPayload.decorator';
import type { JwtPayload } from 'jsonwebtoken';


@Controller('user')
export class UserController {
  constructor(private _userService: UserService) {}

  @Auth({})
  @Get()
  getProfile(@User() user: UserDocument) {
    return { message: 'done', user: user };
  }

  @Auth({})
  // @UsePipes(new FileSizeValidationPipe(allowedFileFormats.img))
  // @UseInterceptors(
  //   FileInterceptor(
  //     'profilePic',
  //     multerOptions({ storageApproach: StorageApproachEnum.Disk }),
  //   ),
  // )
  @Post('upload-profile-pic')
  async uploadProfilePic(@Body() bodyData: any, @User() user: UserDocument) {
    const result = await this._userService.uploadProfilePic(bodyData, user);

    return result;
  }

  @Auth({})
  // @UsePipes(new FileSizeValidationPipe(allowedFileFormats.img))
  @UseInterceptors(
    FilesInterceptor(
      'coverPics',
      5,
      multerOptions({
        storageApproach: StorageApproachEnum.Disk,
        fileSize: 25,
      }),
    ),
  )
  @Post('upload-profile-pic')
  async uploadCoverPics(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: UserDocument,
  ) {
    const result = await this._userService.uploadCoverPics(files, user);

    return result;
  }

  @Auth({})
  @Post('/logout')
  async logOut(
    @Body() bodyData: any,
    @User() user: UserDocument,
    @TokenPayload() tokenPayload:JwtPayload
  ) {
    const result = await this._userService.logOut(bodyData, user, tokenPayload);

    return result;
  }
}
