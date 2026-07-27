import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import CryptoJS from 'crypto-js';

@Injectable()
export class SecurityService {
  constructor(private configService: ConfigService) {}

  encryptValue({
    value,
    key = this.configService.get<string>('ENCRYPTION_KEY') as string,
  }: {
    value: string;
    key?: string;
  }) {
    return CryptoJS.AES.encrypt(value, key).toString();
  }

  decryptValue({
    cipherText,
    key = this.configService.get<string>('ENCRYPTION_KEY') as string,
  }: {
    cipherText: string;
    key?: string;
  }) {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  generateHash = async ({
    plainText,
    salt = Number(this.configService.get<string>('SALT') as string),
  }: {
    plainText: string;
    salt?: number;
  }) => {
    return await hash(plainText, salt);
  };

  compareHash = async ({
    plainText,
    cipherText,
  }: {
    plainText: string;
    cipherText: string;
  }) => {
    return await compare(plainText, cipherText);
  };
}
