import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export class TokenForgotPassword {
  @Prop({
    type: String,
    default: () => `token-${uuidv4()}`,
    unique: true,
  })
  id: string;

  @Prop({
    type: String,
    required: true,
  })
  userGuid: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  token: string;
}

export const TokenForgotPasswordSchema =
  SchemaFactory.createForClass(TokenForgotPassword);
