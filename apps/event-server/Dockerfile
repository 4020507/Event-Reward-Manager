FROM node:18 AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
COPY .env .env
RUN npm run build:event

# 실제 실행 단계
FROM node:18-alpine

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/.env .env

CMD ["node", "dist/apps/event-server/src/main.js"]
