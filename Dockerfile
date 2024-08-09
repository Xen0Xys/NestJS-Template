FROM node:21

LABEL authors="Xen0Xys"

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

COPY tsconfig.json ./

COPY . .

RUN npm install -g pnpm && pnpm install

RUN pnpx prisma generate

EXPOSE 3000

CMD pnpx prisma migrate deploy && pnpx prisma db seed && pnpm start
