import { Prisma } from '@prisma/client';
import { TransformInterceptor } from './src/common/interceptors/transform.interceptor';

function test() {
  const dec = new Prisma.Decimal(15.5);
  console.log("Constructor name:", dec.constructor?.name);
  console.log("Keys:", Object.keys(dec));
  console.log("has d:", dec.hasOwnProperty('d'));
  
  const obj = { id: 1, unitPrice: dec };
  
  const interceptor = new TransformInterceptor();
  const transformed = interceptor['transformDecimals'](obj);
  console.log("After TransformInterceptor:");
  console.log(transformed);
}
test();
