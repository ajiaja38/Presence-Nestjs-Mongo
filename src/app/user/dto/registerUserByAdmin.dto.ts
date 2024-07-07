import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxDate,
} from 'class-validator';

export class RegisterUserByAdminDto {
  @IsOptional()
  @IsString()
  identity?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+62\d{9,13}$/, {
    message:
      'Nomor Telepon harus diawali dengan +62 dan terdiri dari 9-13 angka',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsDate()
  @Type(() => Date)
  @MaxDate(() => new Date(), {
    message: 'Tidak boleh melebihi tanggal sekarang',
  })
  @IsNotEmpty()
  birthDate: Date;

  @IsString()
  @IsOptional()
  profession: string;

  @IsOptional()
  @IsString()
  guidUnit: string;
}
