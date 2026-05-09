import { Prisma } from '@prisma/client';

const obj = { d: [ 15, 5000000 ], e: 1, s: 1 };
Object.setPrototypeOf(obj, Prisma.Decimal.prototype);

try {
  console.log((obj as any).toFixed(2));
} catch (e) {
  console.error("Failed:", e);
}
