import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class NewPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password harus terdiri dari 6 karakter terdiri dari huruf kecil, huruf besar, angka, dan simbol[@$!%*?&]',
    },
  )
  newPassword: string;

  @IsString()
  confirmPassword: string;
}
