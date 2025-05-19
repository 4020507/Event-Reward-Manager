import { BadRequestException, NotFoundException, Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Event } from '@libs/schemas/event.schema';
import { User, UserDocument } from '@libs/schemas/user.schema';
import { EventParticipation } from '@libs/schemas/event-participation.schema';
import { Reward } from '@libs/schemas/reward.schema';
import { MonsterKillLog } from '@libs/schemas/monster-kill-log.schema';
import { LoginLog } from '@libs/schemas/login-log.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UserType } from '../common/enum/user-type.enum'


@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(EventParticipation.name) private readonly participationModel: Model<EventParticipation>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(MonsterKillLog.name) private readonly monsterLogModel: Model<MonsterKillLog>,
    @InjectModel(LoginLog.name) private readonly loginLogModel: Model<LoginLog>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createEvent(dto: CreateEventDto, userId: string) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user || user.type !== UserType.MASTER) {
      throw new ForbiddenException('운영자만 이벤트를 생성할 수 있습니다.');
    }
    console.log(dto);

    const lastEvent = await this.eventModel.findOne().sort({ eventId: -1 });
    const nextEventId = lastEvent ? lastEvent.eventId + 1 : 1;

    try {
      const newEvent = await this.eventModel.create({
        eventName: dto.eventName,
        startDate: dto.startDate,
        endDate: dto.endDate,
        condition: dto.eventCondition,
        eventId: nextEventId,
      });
  
      await this.rewardModel.create({
        eventId: nextEventId,
        condition: dto.rewardCondition,
      });
  
      return newEvent;
    } catch (error: unknown) {
      if (
        error instanceof MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.eventId
      ) {
        throw new ConflictException('eventId가 중복되었습니다. 다시 시도해주세요.');
      }
      throw error;
    }
  }

  // 진행 중 이벤트 조회
  async getOngoingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.eventModel.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
  }

  // 특정 기간 이벤트 조회
  async getEventsInRange(start: string, end: string) {
    if (!start || !end) return [];

    const startDate = new Date(start);
    const endDate = new Date(end);

    return await this.eventModel.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });
  }

  // 참여 신청
  async participateInEvent(eventId: number, userId: string) {
    const user = await this.userModel.findOne({ id: userId }); // todo jwt로부터 받아올 것것
    if (!user || user.type !== UserType.USER) {
      throw new ForbiddenException('유저만 이벤트에 참여할 수 있습니다.');
    }

    const event = await this.eventModel.findOne({ eventId });
    if (!event) throw new BadRequestException('존재하지 않는 이벤트입니다.');

    const isParticipating = await this.participationModel.findOne({ eventId, userId });
    if (isParticipating) throw new BadRequestException('이미 참여중인 이벤트입니다.');

    return await this.participationModel.create({
      eventId,
      userId,
      isCompleted: false,
      rewardRequested: false,
      rewardGiven: false,
      isChecked: false,
      startDate: new Date()
    });
  }

  // 특정 유저 참여중 이벤트 조회 (완료되지 않은 이벤트만)
  async getOngoingParticipations(userId: string) {
    return await this.participationModel.find({
      userId,
      isCompleted: false,
    });
  }

  // 유저가 참여한 종료된 이벤트 목록 조회
  async getEndedParticipatedEvents(userId: string) {
    const participations = await this.participationModel.find({ userId });

    const eventIds = participations.map(p => p.eventId);

    // 현재 날짜 기준으로 종료된 이벤트만 조회
    const endedEvents = await this.eventModel.find({
      eventId: { $in: eventIds },
      endDate: { $lt: new Date() }, // 오늘 이전에 종료된 이벤트
    });

    return endedEvents;
  } 

  // 이벤트 완료 요청
  async requestCompletion(userId: string, eventId: number): Promise<string> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) throw new NotFoundException('이벤트가 존재하지 않습니다.');

    const participation = await this.participationModel.findOne({ eventId, userId });
    if (!participation) throw new BadRequestException('이 이벤트에 참여하지 않았습니다.');

    const today = new Date();
    if (today > event.endDate) {
      await this.participationModel.updateOne({ eventId, userId }, {
        isChecked: true,
        isCompleted: false,
        rewardRequested: true,
        rewardGiven: false,
      });
      return '이벤트가 종료되어 조건 확인이 불가합니다.';
    }

    if (today < event.startDate) {
      await this.participationModel.updateOne({ eventId, userId }, {
        isChecked: false,
        isCompleted: false,
        rewardRequested: false,
        rewardGiven: false,
      });
      return '이벤트가 아직 시작하지 않았습니다.';
    }

    if (participation.isChecked && participation.rewardRequested) {
      return '운영자가 확인 중입니다.';
    }

    const reward = await this.rewardModel.findOne({ eventId });
    if (!reward) throw new NotFoundException('이 이벤트에 대한 보상 정보가 없습니다.');

    console.log('시작');
    const isCompeltedMission = await this.checkConditionMet(userId, event, event.condition);
    console.log('끝');

    if (isCompeltedMission) {
      await this.participationModel.updateOne({ eventId, userId }, {
        isChecked: true,
        isCompleted: true,
        rewardRequested: true,
        rewardGiven: true,
      });
      return '조건을 만족하였습니다. 보상이 지급됩니다.';
    } else {
      await this.participationModel.updateOne({ eventId, userId }, {
        isChecked: false,
        isCompleted: false,
        rewardRequested: false,
        rewardGiven: false,
      });
      return '조건을 만족하지 못했습니다.';
    }
  }

  private async checkConditionMet(userId: string, event: Event, condition: Record<string, any>): Promise<boolean> {
    const now = new Date();
    console.log(event);
    console.log(condition);

    if (condition.type === 'monster') {
      const killCount = await this.monsterLogModel.countDocuments({
        userId,
        monsterName: condition.monsterName,
        killedAt: { $gte: event.startDate, $lte: now },
      });
      return killCount >= condition.killCount;
    }

    if (condition.type === 'attendance') {
      const loginLogs = await this.loginLogModel.find({
        userId,
        loginAt: { $gte: event.startDate, $lte: event.endDate },
      });

      const uniqueDates = new Set(
        loginLogs.map(log => log.loginAt.toISOString().split('T')[0])
      );

      return uniqueDates.size >= condition.requiredDays;
    }

    return false;
  }

  // 보상 받은 미션 조회
  async getEventCompletionHistory(userId: string) {
    return this.participationModel.find({
      userId,
      rewardRequested: true,
    });
  }

  // 보상내역확인 
  async getMyRewardStatus(userId: string, eventId: number) {
    const participation = await this.participationModel.findOne({ userId, eventId });
    if (!participation) {
      throw new NotFoundException('해당 이벤트 참여 정보가 없습니다.');
    }

    const completeMsg = participation.isCompleted ? '완료' : '미완료';
    const rewardGivenMsg = participation.rewardGiven ? '수령' : '미수령';
    const resultMsg = userId + '님은 이벤트를 ' + completeMsg + '하였고 보상을 ' + rewardGivenMsg + '하였습니다.';
    console.log(resultMsg);

    return resultMsg;
  }

  async getEventParticipations(userId: string, eventId: number) {
    const user = await this.userModel.findOne({ id: userId });
  
    if (!user) throw new ForbiddenException('사용자를 찾을 수 없습니다.');
  
    if (user.type === UserType.MASTER || user.type === UserType.WATCHER) {
      return this.participationModel.find({ eventId });
    }
  
    // 일반 유저는 자신의 기록만
    return this.participationModel.find({ eventId, userId });
  }

}
