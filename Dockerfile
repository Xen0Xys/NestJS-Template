FROM oven/bun:alpine

WORKDIR /app

# RUN apk add --no-cache openssl ffmpeg

COPY bun.lock ./
COPY package.json ./
COPY tsconfig.json ./

RUN bun install

COPY prisma ./prisma/
RUN bunx prisma generate

COPY . .

ENV NODE_ENV=production

RUN bun run build

EXPOSE 4000

CMD bunx prisma migrate deploy && bunx prisma db seed && bun run start:prod
