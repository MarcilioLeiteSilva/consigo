import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://marleite01:Cascavel88101@10.11.0.4:5432/consigo3d"
    }
  }
});

async function main() {
  try {
    // Buscar tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("Tenant não encontrado");

    // Buscar PDVs (pegar pelo menos 2)
    const posList = await prisma.pOS.findMany({ where: { tenantId: tenant.id }, take: 2 });
    if (posList.length < 2) throw new Error("PDVs insuficientes. Crie pelo menos 2 PDVs com lotes.");

    const normalPos = posList[0];
    const lowStockPos = posList[1]; // Este ficará com estoque crítico

    // Buscar lotes de consignação
    const normalLots = await prisma.consignmentLot.findMany({ where: { posId: normalPos.id, tenantId: tenant.id }, include: { product: true } });
    const lowStockLots = await prisma.consignmentLot.findMany({ where: { posId: lowStockPos.id, tenantId: tenant.id }, take: 3, include: { product: true } });

    if (normalLots.length === 0 || lowStockLots.length === 0) {
      throw new Error("Não há lotes suficientes nos PDVs para simular vendas. Por favor, crie lotes primeiro.");
    }

    let sql = `-- Simulação de Vendas para 1 Semana\n\n`;

    const today = new Date();
    
    // Função para gerar UUID
    const uuid = () => crypto.randomUUID();

    // 1. Vendas normais ao longo da semana para o PDV 1
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();

      const saleId = uuid();
      let totalAmount = 0;
      let saleItemsSql = '';

      for (const lot of normalLots) {
        // Vende 1 a 3 itens por dia
        const qtyToSell = Math.floor(Math.random() * 3) + 1;
        const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
        if (available >= qtyToSell) {
          const itemPrice = lot.unitPrice ? Number(lot.unitPrice) : 50.00;
          const commissionAmount = (itemPrice * Number(lot.commissionPercent)) / 100;
          totalAmount += itemPrice * qtyToSell;

          saleItemsSql += `
INSERT INTO "sale_items" ("id", "tenantId", "saleId", "productId", "consignmentLotId", "quantity", "unitPrice", "commissionAmount", "createdAt", "updatedAt")
VALUES ('${uuid()}', '${tenant.id}', '${saleId}', '${lot.productId}', '${lot.id}', ${qtyToSell}, ${itemPrice}, ${commissionAmount}, '${dateStr}', '${dateStr}');

UPDATE "consignment_lots" SET "quantitySold" = "quantitySold" + ${qtyToSell}, "updatedAt" = '${dateStr}' WHERE "id" = '${lot.id}';
`;
        }
      }

      if (totalAmount > 0) {
        sql += `
-- Venda PDV Normal (Dia -${i})
INSERT INTO "sales" ("id", "tenantId", "posId", "totalAmount", "createdAt", "updatedAt")
VALUES ('${saleId}', '${tenant.id}', '${normalPos.id}', ${totalAmount}, '${dateStr}', '${dateStr}');
${saleItemsSql}
`;
      }
    }

    // 2. Vendas agressivas no PDV 2 para gerar ESTOQUE CRÍTICO (3 produtos quase zerados)
    const saleIdCrit = uuid();
    let totalAmountCrit = 0;
    let saleItemsSqlCrit = '';
    const critDate = new Date().toISOString();

    for (const lot of lowStockLots) {
      // Deixar apenas 1 ou 2 no estoque
      const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
      const qtyToSell = available > 2 ? available - Math.floor(Math.random() * 2 + 1) : available;
      
      if (qtyToSell > 0) {
        const itemPrice = lot.unitPrice ? Number(lot.unitPrice) : 50.00;
        const commissionAmount = (itemPrice * Number(lot.commissionPercent)) / 100;
        totalAmountCrit += itemPrice * qtyToSell;

        saleItemsSqlCrit += `
INSERT INTO "sale_items" ("id", "tenantId", "saleId", "productId", "consignmentLotId", "quantity", "unitPrice", "commissionAmount", "createdAt", "updatedAt")
VALUES ('${uuid()}', '${tenant.id}', '${saleIdCrit}', '${lot.productId}', '${lot.id}', ${qtyToSell}, ${itemPrice}, ${commissionAmount}, '${critDate}', '${critDate}');

UPDATE "consignment_lots" SET "quantitySold" = "quantitySold" + ${qtyToSell}, "updatedAt" = '${critDate}' WHERE "id" = '${lot.id}';
`;
      }
    }

    if (totalAmountCrit > 0) {
      sql += `
-- Venda Massiva PDV Crítico (Para deixar estoque baixo)
INSERT INTO "sales" ("id", "tenantId", "posId", "totalAmount", "createdAt", "updatedAt")
VALUES ('${saleIdCrit}', '${tenant.id}', '${lowStockPos.id}', ${totalAmountCrit}, '${critDate}', '${critDate}');
${saleItemsSqlCrit}
`;
    }

    fs.writeFileSync('sales_simulation.sql', sql);
    console.log("SQL gerado com sucesso em sales_simulation.sql");

  } catch (e) {
    console.error("Erro:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
