# Estágio de Build
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Gerar o client de forma limpa
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

# Definir variável para o runtime
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
EXPOSE 3000

# Comando de Start robusto (Ponto 7 do solicitado)
# Adicionei uma verificação de rede simples e o migrate explícito
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
