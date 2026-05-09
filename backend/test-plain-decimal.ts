import { Prisma } from '@prisma/client';

const obj = { d: [ 15, 5000000 ], e: 1, s: 1 };
try {
  const dec = new Prisma.Decimal(obj as any);
  console.log(dec.toFixed(2));
} catch (e) {
  console.error("Failed:", e);
}
