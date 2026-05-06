# Estágio de Build
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependências necessárias para o Prisma no Linux
RUN apt-get update && apt-get install -y openssl python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Forçar o uso do motor library e gerar o client
ENV PRISMA_CLIENT_ENGINE_TYPE='library'
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
COPY --from=builder /app/prisma.config.ts ./

# Variáveis para garantir o motor correto em tempo de execução
ENV PRISMA_CLIENT_ENGINE_TYPE='library'
EXPOSE 3000

# Script para rodar migrações e iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
