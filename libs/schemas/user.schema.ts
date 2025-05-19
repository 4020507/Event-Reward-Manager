import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  type!: string; // 1, 2, 3

  @Prop()
  typeNm!: string; // 운영자, 감시자, 사용자
}

export const UserSchema = SchemaFactory.createForClass(User);