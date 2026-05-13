# Relatório de Desenvolvimento - Consigo
**Data:** 13 de Maio de 2026
**Status:** Funcionalidades de Devolução e Perda Operacionais (Web & Mobile)

---

## 1. Implementações de Back-end (NestJS)

### 🔄 Módulo de Devolução (Return)
- **Lógica de Negócio**: Criado o endpoint `POST /consignment-lots/:id/return`.
- **Fluxo de Estoque**: A devolução retira o produto do PDV (incrementa `quantityReturned`) e cria automaticamente um novo lote no **Estoque Central** para revenda.
- **Integridade**: Garantia de que a quantidade devolvida não excede o saldo atual do lote.

### 📉 Módulo de Registro de Perdas (Loss)
- **Lógica de Negócio**: Criado o endpoint `POST /consignment-lots/:id/loss`.
- **Alimentação Negativa**: Implementada lógica onde a perda no PDV gera um lote de ajuste negativo no **Estoque Central**, reduzindo o saldo global disponível.
- **Financeiro**: Integração automática com o módulo financeiro, gerando uma transação de `ADJUSTMENT` (Débito) para cada perda registrada, preservando o histórico para fechamentos.

---

## 2. Implementações Front-end Web (Next.js)

### 🖥️ Interface de Gestão de PDV
- **Modais de Movimentação**: Implementados modais de "Devolver Produtos" e "Registrar Perda" diretamente na tela de detalhes do PDV.
- **Atualização em Tempo Real**: A tabela de estoque no dashboard web agora reflete as perdas e devoluções imediatamente após a operação.

---

## 3. Implementações Mobile (Flutter)

### 📱 Experiência do Operador
- **Telas Dedicadas**: Criadas as telas `PosReturnScreen` e `PosLossScreen` com foco em agilidade de input.
- **Menu de Ações**: Habilitados os menus "Abastecer", "Devolver" e "Registrar Perda" no botão de opções (três pontinhos) do PDV.
- **Correções de Estabilidade (Release)**:
    - **Parsing JSON**: Corrigido erro de "null subtype" ao carregar lotes ativos.
    - **Permissões Android**: Corrigida a falta de permissão de internet no `AndroidManifest.xml` que impedia o login no APK de Release.
    - **Resiliência de Login**: Atualizado o modelo `UserProfile` para suportar diferentes formatos de ID (UUID e JWT sub).

---

## 4. Banco de Dados (Prisma)
- **Schema Update**: Adicionado campo `quantityLost` na tabela `consignment_lots`.
- **Comando SQL Aplicado**: 
  ```sql
  ALTER TABLE "consignment_lots" ADD COLUMN "quantityLost" INTEGER NOT NULL DEFAULT 0;
  ```

---

## 5. Artefatos de Entrega
- **APK Instalável**: Gerado em `mobile/build/app/outputs/flutter-apk/app-release.apk`.
- **Backup do Código**: Criado arquivo `backup_consigo_13_05_2026.zip`.

---
**Próximos Passos Sugeridos:**
- Monitorar os primeiros fechamentos (Settlements) usando as novas variáveis de perda.
- Opcionalmente, adicionar fotos no registro de perdas mobile.
