import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy'

import { Event, EventSchema } from '@libs/schemas/event.schema';
// import { EventCondition, EventConditionSchema } from '@libs/schemas/event-condition.schema';
import { EventParticipation, EventParticipationSchema } from '@libs/schemas/event-participation.schema';
// import { RewardType, RewardTypeSchema } from '@libs/schemas/reward-type.schema';
import { Reward, RewardSchema } from '@libs/schemas/reward.schema';
import { Monster, MonsterSchema } from '@libs/schemas/monster.schema';
import { MonsterKillLog, MonsterKillLogSchema } from '@libs/schemas/monster-kill-log.schema';
import { User, UserSchema } from '@libs/schemas/user.schema';
import { LoginLog, LoginLogSchema } from '@libs/schemas/login-log.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonsterController } from './monster/monster-controller';
import { MonsterService } from './monster/monster-service';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service'

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
     }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('EVENT_MONGO_URI'),
        dbName: 'event-reward-db',
      }),
    }),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      // { name: EventCondition.name, schema: EventConditionSchema },
      { name: EventParticipation.name, schema: EventParticipationSchema },
      // { name: RewardType.name, schema: RewardTypeSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Monster.name, schema: MonsterSchema },
      { name: MonsterKillLog.name, schema: MonsterKillLogSchema },
      { name: User.name, schema: UserSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
    }),
  ],
  controllers: [AppController, MonsterController, EventController],
  providers: [AppService, MonsterService, EventService, JwtStrategy],
})
export class AppModule {}
