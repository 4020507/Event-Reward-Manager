import { IsNumber } from 'class-validator';

export class EventParticipationDto {
  @IsNumber()
  eventId!: number;
}