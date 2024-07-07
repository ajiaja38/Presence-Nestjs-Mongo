import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  async importDataFromExcel<T>(file: Express.Multer.File): Promise<T[]> {
    try {
      const workbook: XLSX.WorkBook = XLSX.read(file.buffer, {
        type: 'buffer',
      });
      const workSheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(workSheet);
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  }

  exportDataToExcel<T>(data: T[], name: string): Buffer {
    const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, workSheet, name);
    const buffer: Buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
    return buffer;
  }
}
