import { PrismaClient } from '@prisma/client';
import { TransformInterceptor } from './src/common/interceptors/transform.interceptor';

async function test() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://marleite01:Cascavel88101@10.11.0.4:5432/consigo3d"
      }
    }
  });
  
  try {
    const lot = await prisma.consignmentLot.findFirst();
    console.log("Raw from DB:");
    console.dir(lot, { depth: null });

    const interceptor = new TransformInterceptor();
    const transformed = interceptor['transformDecimals'](lot);
    console.log("After Transform:");
    console.dir(transformed, { depth: null });
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
