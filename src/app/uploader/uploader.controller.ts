import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { resolve } from 'path';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { multerOptions } from 'src/config/multer.config';

@Controller('uploader')
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Post()
  @UseInterceptors(
    FileFastifyInterceptor(
      'file',
      multerOptions(resolve(__dirname, '../../public')),
    ),
  )
  protected uploadFileHandler(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return this.uploaderService.uploadFile(file);
  }

  @Delete('/:filename')
  protected deleteFileHandler(
    @Param('filename') filename: string,
  ): Promise<void> {
    return this.uploaderService.deleteFile(filename);
  }
}
