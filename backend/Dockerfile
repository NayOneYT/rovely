FROM node:22-alpine AS base
WORKDIR /app
COPY backend/package*.json ./

FROM base AS backend-dev
RUN npm i
COPY backend ./
RUN npx prisma generate
COPY shared /shared/
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]