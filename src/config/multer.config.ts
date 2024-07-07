import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

export const multerOptions = (uploadPath: string) => ({
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
