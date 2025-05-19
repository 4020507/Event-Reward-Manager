import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventParticipation extends Document {
  @Prop({ required: true })
  eventId!: number;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  startDate!: Date; // 이벤트 시작 날짜

  @Prop({ required: true })
  isChecked!: boolean; // 운영자 체크 여부

  @Prop({ required: true })
  isCompleted!: boolean; // 이벤트 조건 완료 여부

  @Prop({ default: false })
  rewardRequested!: boolean; // 보상 요청 여부

  @Prop({ default: false })
  rewardGiven!: boolean; // 보상 제공 여부
}

export const EventParticipationSchema = SchemaFactory.createForClass(EventParticipation);