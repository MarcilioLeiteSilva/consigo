import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    include: { items: true }
  });
  console.log('Total Sales:', sales.length);
  
  const pendingItems = await prisma.saleItem.findMany({
    where: { settlementId: null }
  });
  console.log('Pending Sale Items:', pendingItems.length);
  
  const settlements = await prisma.consignmentSettlement.findMany();
  console.log('Total Settlements:', settlements.length);
}

main().finally(() => prisma.$disconnect());
