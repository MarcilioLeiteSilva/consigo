import { Decimal } from '@prisma/client/runtime/library';

/**
 * Utilitários para manipulação de valores monetários com precisão decimal.
 * Evita problemas de arredondamento de floats do JavaScript.
 */

export const toMoneyString = (value: number | string | Decimal): string => {
  return new Decimal(value.toString()).toFixed(2);
};

export const toDecimal = (value: any): Decimal => {
  try {
    if (value === null || value === undefined || value === '' || value === '[object Object]') {
      return new Decimal(0);
    }
    return new Decimal(value.toString());
  } catch (e) {
    return new Decimal(0);
  }
};

export const safeAdd = (a: number | string | Decimal, b: number | string | Decimal): Decimal => {
  return new Decimal(a.toString()).plus(new Decimal(b.toString()));
};

export const safeSubtract = (a: number | string | Decimal, b: number | string | Decimal): Decimal => {
  return new Decimal(a.toString()).minus(new Decimal(b.toString()));
};

export const safeMultiply = (a: number | string | Decimal, b: number | string | Decimal): Decimal => {
  return new Decimal(a.toString()).times(new Decimal(b.toString()));
};

export const safeDivide = (a: number | string | Decimal, b: number | string | Decimal): Decimal => {
  const decimalB = new Decimal(b.toString());
  if (decimalB.isZero()) return new Decimal(0);
  return new Decimal(a.toString()).div(decimalB);
};
