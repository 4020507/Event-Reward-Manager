import { Controller, Post, Get, Query, Req, Param, Body, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventParticipationDto } from './dto/event-participation.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('events')
@UseGuards(AuthGuard('jwt'))
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  async createEvent(@Body() dto: CreateEventDto, @Req() req: Request) {
    return await this.eventService.createEvent(dto, (req.user as JwtPayload).userId);
  }

  @Get('ongoing')
  async getOngoingEvents() {
    return await this.eventService.getOngoingEvents();
  }

  @Get('range')
  async getEventsInRange(@Query('start') start: string, @Query('end') end: string) {
    return await this.eventService.getEventsInRange(start, end);
  }

  @Post('participation')
  async participate(@Body() dto: EventParticipationDto, @Req() req: Request) {
    return await this.eventService.participateInEvent(dto.eventId, (req.user as JwtPayload).userId);
  }

  @Get('my/ongoing')
  async getMyOngoingEvents(@Req() req: Request) {
    return await this.eventService.getOngoingParticipations((req.user as JwtPayload).userId);
  }

  @Get('my/ended')
  async getMyEndedEvents(@Req() req: Request) {
    return await this.eventService.getEndedParticipatedEvents((req.user as JwtPayload).userId);
  }

  @Post(':eventId/completion')
  async requestCompletion(@Param('eventId') eventId: number, @Req() req: Request) {
    return this.eventService.requestCompletion((req.user as JwtPayload).userId, eventId);
  }

  @Get('my/completion-history')
  async getCompletionHistory(@Req() req: Request) {
    return this.eventService.getEventCompletionHistory((req.user as JwtPayload).userId);
  }

  @Get(':eventId/status')
  async getMyRewardStatus(@Param('eventId') eventId: number, @Req() req: Request) {
    return this.eventService.getMyRewardStatus((req.user as JwtPayload).userId, eventId);
  }

  @Get(':eventId/participations')
  async getEventParticipations(@Param('eventId') eventId: number, @Req() req: Request) {
    return this.eventService.getEventParticipations((req.user as JwtPayload).userId, eventId);
  }
}
