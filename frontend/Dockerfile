# Estágio de Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Variável para apontar para a API no build se necessário
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Estágio de Produção
FROM node:20-slim

WORKDIR /app

# Copiar apenas o necessário do build (Next.js standalone é o ideal, mas vamos usar o padrão por enquanto)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
