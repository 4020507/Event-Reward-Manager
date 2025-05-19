import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventCompletionRequest extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  eventId!: number;

  @Prop({ required: true }) // 수락 여부
  isPassed!: boolean;

  @Prop({ type: Object }) // ex. { attendanceCount: 7, hunted: ["고블린", "슬라임"] }
  conditionLog!: Record<string, any>;

  @Prop({ default: false }) // 확인 여부
  checked!: boolean;
}

export const EventCompletionRequestSchema = SchemaFactory.createForClass(EventCompletionRequest);
