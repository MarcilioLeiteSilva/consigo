const { PrismaClient } = require('@prisma/client');
const { TransformInterceptor } = require('./src/common/interceptors/transform.interceptor');

async function test() {
  const prisma = new PrismaClient();
  const lot = await prisma.consignmentLot.findFirst();
  console.log("Raw from Prisma:");
  console.log(lot);
  
  const interceptor = new TransformInterceptor();
  const transformed = interceptor.transformDecimals(lot);
  console.log("After TransformInterceptor:");
  console.log(transformed);
  
  await prisma.$disconnect();
}
test();
