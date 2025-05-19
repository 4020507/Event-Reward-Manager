import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe  } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@libs/schemas/user.schema';
import { Model } from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // DTO 유효성 검사
    await app.init();
  });

  describe('회원가입 성공 테스트', () => {
    const testUser = {
      id: 'testuser',
      password: '1234',
      typeNm: '사용자',
    };

    it('기존 테스트 유저 제거 후 가입 성공', async () => {
      await userModel.deleteOne({ id: testUser.id }); // 제거

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('id', testUser.id);
    });
  });

  describe('회원가입 실패패 테스트', () => {
    const testUser = {
      id: 'testuser',
      password: '1234',
      typeNm: '사용자',
    };

    it('중복가입 테스트', async () => {
      const exists = await userModel.exists({ id: 'testuser' });

      if(!exists) {
        await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser);
      }

      const res = await request(app.getHttpServer())
                .post('/auth/signup')
                .send(testUser)
                .expect(400);

      expect(res.body.message).toContain('duplicate');
    });
  });
});
