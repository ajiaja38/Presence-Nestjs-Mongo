import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, unlinkSync } from 'fs';
import { resolve } from 'path';
import { MessageService } from '../message/message.service';
import { IUploaderService } from './interface/uploaderService.interface';

@Injectable()
export class UploaderService implements IUploaderService {
  private client: S3Client;

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
  ) {
    this.client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('accesskey'),
        secretAccessKey: this.configService.get<string>('secretkey'),
      },
      region: 'idn',
      endpoint: `https://${this.configService.get<string>('endpoint')}`,
    });
  }

  public async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension: string = file.originalname.substring(
        file.originalname.lastIndexOf('.'),
      );
      const fileName: string = `pict-${Date.now()}-${Math.floor(
        Math.random() * 10000,
      )}${fileExtension}`;

      const Bucket: string = this.configService.get<string>('bucket');
      const Key: string = `data/kehadiran/image/${fileName}`;
      const bodyStream = createReadStream(file.path);

      const command: PutObjectCommand = new PutObjectCommand({
        Bucket,
        Key,
        Body: bodyStream,
        ContentEncoding: 'base64',
        ContentType: file.mimetype,
      });

      await this.client.send(command);

      this.messageService.setMessage('File uploaded successfully');

      return `https://${Bucket}.nos.wjv-1.neo.id/${Key}`;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    } finally {
      const filePath = resolve(__dirname, `../../public/${file.filename}`);
      unlinkSync(filePath);
    }
  }

  public async deleteFile(filename: string): Promise<void> {
    const Bucket: string = this.configService.get<string>('bucket');
    const Key: string = `data/kehadiran/image/${filename}`;

    const getCommand: GetObjectCommand = new GetObjectCommand({
      Bucket,
      Key,
    });

    await this.client.send(getCommand);

    const command: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    await this.client.send(command);

    this.messageService.setMessage('File deleted successfully');
  }
}
