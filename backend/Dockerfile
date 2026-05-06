# Estágio de Build
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Forçar o motor BINARY e garantir que o Prisma seja regerado
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
# O comando abaixo (echo) serve apenas para quebrar o cache do Docker neste ponto
RUN echo "Build em $(date)" && npx prisma generate

RUN npm run build

# Estágio de Produção
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
EXPOSE 3000

# Rodar migrações e iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
