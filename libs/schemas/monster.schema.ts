import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Monster extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  hp!: number;
}

export const MonsterSchema = SchemaFactory.createForClass(Monster);