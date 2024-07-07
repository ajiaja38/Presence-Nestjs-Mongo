export interface IUploaderService {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(filename: string): Promise<void>;
}
