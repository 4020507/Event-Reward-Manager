import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  eventName!: string;

  @Prop({ required: true, unique: true }) // 이벤트 번호. 등록될 때마다 하나씩 자동 증가
  eventId!: number;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ type: Object, required: true }) // 조건을 유연하게 저장 (예: JSON), 지금은 개수만 출석체크 개수, 특정 몬스터 개수
  condition!: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);