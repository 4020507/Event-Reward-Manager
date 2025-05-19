import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LoginLog extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ default: Date.now })
  loginAt!: Date;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);