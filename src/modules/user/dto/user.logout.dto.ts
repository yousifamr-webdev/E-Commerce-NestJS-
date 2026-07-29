import { IsEnum, IsString } from 'class-validator';

export class logOutDto {
  @IsString()
  logoutOptions!: string;
}
