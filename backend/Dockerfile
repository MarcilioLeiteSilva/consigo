# Estágio de Build
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl python3 make g++

COPY package*.json ./
# Forçar a reinstalação limpa
RUN npm ci

COPY . .

# Deletar qualquer client gerado anteriormente e forçar o BINARY
RUN rm -rf node_modules/.prisma node_modules/@prisma/client
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
RUN npx prisma generate

RUN npm run build

# Estágio de Produção
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Garantir que o motor binário seja usado
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
EXPOSE 3000

# Rodar migrações e iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
