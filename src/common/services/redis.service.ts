import { Inject, Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';
import type { RedisClientType } from 'redis';
import { OTPEnum } from 'src/common/enum/otp.enums';

@Injectable()
export class RedisService {
  constructor(@Inject('Redis_Client') private _client: RedisClientType) {}

  blackListTokenKey({ userId, tokenId }: { userId: string; tokenId: string }) {
    return `blackLisToken::${userId}::${tokenId}`;
  }

  getOTPKey({ email, otpType }: { email: string; otpType: OTPEnum }) {
    return `OTP::${email}::${otpType}`;
  }
  getOTPReqNoKey({ email, otpType }: { email: string; otpType: OTPEnum }) {
    return `OTP::${email}::${otpType}::No`;
  }

  getOTPBlockedStatusKey({
    email,
    otpType,
  }: {
    email: string;
    otpType: OTPEnum;
  }) {
    return `OTP::${email}::${otpType}::Blocked`;
  }

  async set({
    key,
    value,
    exType = 'EX',
    exValue = 30,
  }: {
    key: string;
    value: number | string;
    exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT';
    exValue?: number;
  }) {
    return await this._client.set(key, value, {
      expiration: { type: exType, value: Math.floor(exValue) },
    });
  }

  async get(key: string): Promise<string | number | null> {
    return await this._client.get(key);
  }

  async incr(key: string) {
    return await this._client.incr(key);
  }

  async decr(key: string) {
    return await this._client.decr(key);
  }

  async mget(keys: [string]) {
    return await this._client.mGet(keys);
  }

  async ttl(key: string) {
    return await this._client.ttl(key);
  }

  async exists(key: string) {
    return await this._client.exists(key);
  }
  async persists(key: string) {
    return await this._client.persist(key);
  }
  async del(key: string) {
    return await this._client.del(key);
  }

  async update(key: string, value: number) {
    if (!(await this.exists(key))) {
      return 0;
    }
    await this._client.set(key, value);
    return 1;
  }

  async setExpire({
    key,
    exType = 'EX',
    exValue = 30,
  }: {
    key: string;
    exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT';
    exValue?: number;
  }) {
    const value = Math.floor(exValue);

    if (exType === 'EX') {
      return await this._client.expire(key, value);
    }

    if (exType === 'PX') {
      return await this._client.pExpire(key, value);
    }

    throw new Error("Invalid expiration type. Use 'EX' or 'PX'");
  }

  getFCMKey(userId: Types.ObjectId | string) {
    return `FCM::${userId}`;
  }

  async addFCMTokenToSet(userId: Types.ObjectId | string, fcmToken: string) {
    return await this._client.sAdd(this.getFCMKey(userId), fcmToken);
  }

  async getMemberFCMToken(userId: Types.ObjectId | string) {
    return await this._client.sMembers(this.getFCMKey(userId));
  }

  getSocketIoKey(userId: Types.ObjectId | string) {
    return `SocketIoUserIds::${userId}`;
  }

  async addSocketIoIdToSet(userId: Types.ObjectId | string, SocketId: string) {
    return await this._client.sAdd(this.getSocketIoKey(userId), SocketId);
  }

  async removeSocketId(userId: Types.ObjectId | string, SocketId: string) {
    return await this._client.sRem(this.getSocketIoKey(userId), SocketId);
  }

  async getMemberSocketIoId(userId: Types.ObjectId | string) {
    return await this._client.sMembers(this.getSocketIoKey(userId));
  }
}
