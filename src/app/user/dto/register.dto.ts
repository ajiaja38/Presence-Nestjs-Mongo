import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxDate,
} from 'class-validator';
import { EInstitution } from 'src/utils/types/enum/EInstitution.enum';

export class RegisterUserDto {
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

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password harus terdiri dari 6 karakter terdiri dari huruf kecil, huruf besar, angka, dan simbol[@$!%*?&]',
    },
  )
  password: string;

  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsString()
  @IsEnum(EInstitution, {
    message: `Institution must be ${EInstitution.COMPANY} Or ${EInstitution.SCHOOL}`,
  })
  institutionType: EInstitution;

  location?: {
    latitude: number;
    longitude: number;
  };

  @IsOptional()
  @IsString()
  institutionGuid?: string;
}
