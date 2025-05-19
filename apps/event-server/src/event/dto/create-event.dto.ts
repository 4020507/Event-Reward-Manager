import { IsString, IsDateString, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  eventName!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsObject()
  eventCondition!: Record<string, any>; // 이벤트 조건 (예: 출석 7일)

  @IsObject()
  rewardCondition!: Record<string, any>; // 보상 내용 (예: 골드 1000개)
}
