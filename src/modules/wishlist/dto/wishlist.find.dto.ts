import { IsOptional, IsString, IsBoolean, IsNotEmpty, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class GetWishlistsDto {
    @IsNotEmpty()
    @IsMongoId()
    wishlistId!:Types.ObjectId
}
