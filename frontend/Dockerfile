FROM node:22-alpine AS base
WORKDIR /app
COPY frontend/package*.json ./

FROM base AS frontend-dev
RUN npm i
COPY frontend ./
COPY shared /shared/
CMD ["npm", "run", "dev"]