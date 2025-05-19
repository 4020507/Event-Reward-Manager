import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reward extends Document {
  @Prop({ required: true })
  eventId!: number; // event schema와 eventId 연계

  @Prop({ type: Object, required: true }) // 조건을 유연하게 저장 (예: JSON), 돈.. 얼마, 아이템... 몇개
  condition!: Record<string, any>;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);