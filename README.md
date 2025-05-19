# 🎉 이벤트 보상 시스템

NestJS 기반 이벤트/보상 관리 시스템입니다. 사용자 유형에 따라 이벤트 생성, 참여, 완료 요청 등을 처리할 수 있고, MongoDB를 통해 데이터를 저장합니다.

---

## 시행 방법

```bash
# 패키지 설치
npm install

# 빌드
npm run build

# 시행 (Docker 기반)
docker-compose up --build
```

* Node.js: v18 (LTS)
* NestJS: 최신 안정화 버전
* MongoDB: 도커로 자동 구성됨

---

## 프로젝트 구조

```
apps/
  ├— auth-server/              # 인증 서버
  ├— event-server/             # 이벤트 서버
  └— gateway-server/           # API 게이트워이

libs/
  └— schemas/           # 공통 MongoDB 스키마

docker-compose.yml       # 전체 앱 시행 환경 구성
```

---

## 주요 기능

* **회원가입/로그인/로그아웃/비밀번호 변경/회원탈퇴**
* **이벤트 생성 (출석/몬스터 사냥 기반)**
* **유저 이벤트 참여**
* **이벤트 완료 요청 및 보상 확인**
* **감시시자/운영자에 의한 참여 현황 확인**

---

## 스키마 구조

```
[User]
- id: string
- password: string
- type: string ("1" 운영자, "2" 감시시자, "3" 사용자)

[Event]
- eventId: number (자동 증가)
- eventName: string
- startDate: Date
- endDate: Date
- eventCondition: object (출석, 몬스터 사냥 구현)
- rewardCondition: object (보상 JSON)

[EventParticipation]
- eventId: number
- userId: string
- startDate: Date
- isChecked: boolean        // 운영자 체크 여부
- isCompleted: boolean      // 이벤트 조건 완료 여부
- rewardRequested: boolean  // 보상 요청 여부
- rewardGiven: boolean      // 보상제공여부부

[LoginLog]
- userId: string
- loginAt: Date

[MonsterKillLog]
- userId: string
- monsterName: string
- killedAt: Date

[LoginLog]
- userId: string
- loginAt: Date
```

---

## 테스트용 API 예시

### Auth

```http
POST http://localhost:3001/auth/login
```

```json
{
  "id": "master1",
  "password": "master1",
  "typeNm": "운영자"
}
```

```json
{
  "id": "watcher1",
  "password": "watcher1",
  "typeNm": "감시자"
}
```

```json
{
  "id": "user1",
  "password": "user1",
  "typeNm": "사용자"
}
```

---

### 몬스터 등록 및 사냥

```http
POST http://localhost:3002/monsters/create
```

```json
{
  "name": "monster1"
}
```

```http
POST http://localhost:3002/monsters/kill
```

```json
{
  "monsterName": "monster1"
}
```

---

### 이벤트 생성

```http
POST http://localhost:3002/events/create
```

**출석 기반 이벤트**

```json
{
  "eventName": "출석 이벤트 7일",
  "startDate": "2025-05-20",
  "endDate": "2025-05-27",
  "eventCondition": {
    "type": "attendance",
    "requiredDays": 7
  },
  "rewardCondition": {
    "type": "meso",
    "amount": 1000
  }
}
```

**몬스터 기반 이벤트**

```json
{
  "eventName": "몬스터 처치 이벤트",
  "startDate": "2025-05-16",
  "endDate": "2025-05-25",
  "eventCondition": {
    "type": "monster",
    "monsterName": "monster1",
    "killCount": 5
  },
  "rewardCondition": {
    "type": "item",
    "itemId": "potion_001",
    "quantity": 5
  }
}
```

---

### 이벤트 참여 / 조회 / 완료 요청

```http
GET http://localhost:3002/events/ongoing
```

```http
GET http://localhost:3002/events/range?start=2025-05-01&end=2025-05-31
```

```http
POST http://localhost:3002/events/participation
```

```json
{
  "eventId": 1
}
```

```http
POST http://localhost:3002/events/1/completion
```

```http
GET http://localhost:3002/events/my/completion-history
```

```http
GET http://localhost:3002/events/1/status
```

```http
GET http://localhost:3002/events/1/participations
```

---

## 고민한 부분 및 개선 필요

* **스키마 관리 방식**: 모든 서버에서 공통으로 쓰기 위해 libs/schemas 폴더에 통합, event, monster, reward, user 등 각각의 디렉토리로 분류 필요
* **Reward 조건의 유연성**: JSON 기반 조건으로 설계, 하지만 향후 조건 복잡도 증가 시 구조 변경 고려
* **트랜젝션 및 동시성 문제**: 이벤트 등록, 이벤트 참여, 보상 요청 등 동시 요청시 문제 발생이 될 요지가 있음.
* **대량 데이터 조회**: 이벤트 참여한 유저 조회 등 대량의 데이터가 존재할 수 있는 api 조회시 많은 시간 소요가 될 수 있음
* **EventService 역할이 커보임**: 이벤트 관리 및 보상 관리까지 하는 것으로 보이므로 별도 분리 필요요
