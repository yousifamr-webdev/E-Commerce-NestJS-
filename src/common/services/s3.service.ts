import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'node:fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageApproachEnum } from '../enum/multer.enums.js';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3BucketService {
  private REGION!: string;
  private ACCESS_KEY_ID!: string;
  private SECRET_ACCESS_KEY!: string;
  private BUCKET_NAME!: string;
  private APPLICATION_NAME!: string;
  private _client!: S3Client; 
  constructor(private _configService: ConfigService) {
    this.REGION = _configService.get<string>('REGION')!;
    this.ACCESS_KEY_ID = _configService.get<string>('ACCESS_KEY_ID')!;
    this.SECRET_ACCESS_KEY = _configService.get<string>('SECRET_ACCESS_KEY')!;
    this.BUCKET_NAME = _configService.get<string>('BUCKET_NAME')!;
    this.APPLICATION_NAME = _configService.get<string>('APPLICATION_NAME')!;
    this._client = new S3Client({
      region: this.REGION,
      credentials: {
        accessKeyId: this.ACCESS_KEY_ID,
        secretAccessKey: this.SECRET_ACCESS_KEY,
      },
    });
  }

  async createPreSignedUploadFileUrl({
    originalname,
    contentType,
    path,
  }: {
    originalname: string;
    contentType: string;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`,
      ContentType: contentType,
      ACL: ObjectCannedACL.private,
    });

    const url = await getSignedUrl(this._client, command, { expiresIn: 3600 });

    return { key: command.input.Key!, url };
  }

  async uploadFile({
    file,
    path,
  }: {
    file: Express.Multer.File;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.private,
    });

    await this._client.send(command);

    return command.input.Key!;
  }

  async uploadLargeFile({
    file,
    path,
    uploadApproach = StorageApproachEnum.Disk,
  }: {
    file: Express.Multer.File;
    path: string;
    uploadApproach?: StorageApproachEnum;
  }) {
    const command = new Upload({
      client: this._client,
      params: {
        Bucket: this.BUCKET_NAME,
        Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
        Body:
          uploadApproach == StorageApproachEnum.Memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });

    const uploadedFile = await command.done();
    return uploadedFile.Key as string;
  }

  async uploadFiles({
    files,
    path,
    uploadApproach = StorageApproachEnum.Memory,
  }: {
    files: Express.Multer.File[];
    path: string;
    uploadApproach?: StorageApproachEnum;
  }) {
    const keys = await Promise.all(
      files.map((file) => {
        return uploadApproach == StorageApproachEnum.Memory
          ? this.uploadFile({ file, path })
          : this.uploadLargeFile({
              file,
              path,
              uploadApproach: StorageApproachEnum.Disk,
            });
      }),
    );

    return keys;
  }

  async getFile(Key: string) {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key,
    });

    return await this._client.send(command);
  }

  async createPreSignedGetFile({
    Key,
    filename,
    download,
  }: {
    Key: string;
    filename?: string;
    download?: string;
  }) {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key,
      ResponseContentDisposition:
        download == 'true' ? `attachment; filename=${filename}` : undefined,
    });

    return await getSignedUrl(this._client, command, { expiresIn: 3600 });
  }

  async deleteFile(Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key,
    });

    return await this._client.send(command);
  }

  async deleteFiles(Keys: { Key: string }[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.BUCKET_NAME,
      Delete: { Objects: Keys },
    });

    return await this._client.send(command);
  }

  async listFolderKeys(Prefix: string) {
    const command = new ListObjectsV2Command({
      Bucket: this.BUCKET_NAME,
      Prefix: `${this.APPLICATION_NAME}/${Prefix}`,
    });

    return await this._client.send(command);
  }
}
