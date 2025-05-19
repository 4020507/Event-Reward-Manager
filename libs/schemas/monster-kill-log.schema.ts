import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MonsterKillLog extends Document {

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  monsterName!: string;

  @Prop({ default: Date.now })
  killedAt!: Date;
}

export const MonsterKillLogSchema = SchemaFactory.createForClass(MonsterKillLog);