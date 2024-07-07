import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  sendEmailForgotPassword(
    email: string,
    name: string,
    token: string,
    session?: ClientSession,
  ): void {
    try {
      if (session)
        this.mailerService.sendMail({
          to: email,
          subject: '[PRESENCE] Your Token Forgot Password',
          html: `
            <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Konfirmasi OTP</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style type="text/css">
              body {
                margin: 0;
                padding: 0;
                font-family: sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #333;
                background-color: #f7f7f7;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 28px;
                color: #333;
              }
              .header p {
                margin-top: 0;
                margin-bottom: 0;
                font-size: 16px;
                color: #666;
              }
              .content {
                margin-bottom: 20px;
              }
              .content p {
                margin-top: 0;
                margin-bottom: 20px;
                font-size: 16px;
                line-height: 1.5;
                color: #333;
              }
              .footer {
                padding: 10px;
                background-color: #f1f1f1;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 5px 5px;
              }
              .footer a {
                color: #666;
                text-decoration: none;
              }
              .footer a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Konfirmasi OTP Lupa Password</h1>
                <p>Terima kasih telah mendaftar di presensi PT.LSKK!</p>
              </div>
              <div class="content">
                <p>Halo ${name},</p>
                <p>Silakan gunakan kode OTP ini untuk mengonfirmasi perubahan password Anda:</p>
                <p style="color: red;">Kode OTP ini hanya berlaku selama 2 menit, mohon segera verifikasi pada website!</p>
                <p style="font-size: 36px; font-weight: bold; color: #007bff;">${token}</p>
                <p>Harap jangan berikan kode ini kepada siapapun.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Presensi PT.LSKK. All rights reserved.</p>
                <p style="font-size: 10px;">Jalan Pelajar Pejuang 45 Nomor 65 Bandung</p>
              </div>
            </div>
          </body>
        </html>
          `,
        });
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  }
}
