import { Prisma } from '@prisma/client';

/**
 * Utilitário para converter valores de entrada para Prisma.Decimal.
 * Garante que nulos, vazios ou indefinidos sejam tratados com precisão.
 */
export const toPrismaDecimal = (value: any): Prisma.Decimal => {
  if (value === null || value === undefined || value === '' || value === '[object Object]') {
    return new Prisma.Decimal(0);
  }

  try {
    // Se for um objeto com a estrutura do Decimal.js {d, e, s} (comum após interceptores/clonagem)
    if (typeof value === 'object' && value.d && Array.isArray(value.d) && value.hasOwnProperty('e')) {
      return new Prisma.Decimal(value);
    }
    
    // Tratamento para strings com vírgula (formato brasileiro)
    const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
    
    return new Prisma.Decimal(normalizedValue);
  } catch (e) {
    console.error('Erro ao converter para Prisma.Decimal:', value, e);
    return new Prisma.Decimal(0);
  }
};

/**
 * Converte um Prisma.Decimal para string formatada com 2 casas decimais.
 * Suporta instâncias reais e objetos de estado "planos".
 */
export const toMoneyString = (value: any): string => {
  if (value === null || value === undefined) return '0.00';

  // Se for uma instância real do Prisma.Decimal
  if (typeof value.toFixed === 'function') {
    return value.toFixed(2);
  }

  // Se for um objeto plano {d, e, s}
  if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
    try {
      return new Prisma.Decimal(value).toFixed(2);
    } catch (e) {
      return '0.00';
    }
  }

  // Se for número ou string
  try {
    return new Prisma.Decimal(value).toFixed(2);
  } catch (e) {
    return '0.00';
  }
};

/**
 * Funções matemáticas seguras para lidar com Prisma.Decimal
 */
export const safeAdd = (a: any, b: any): Prisma.Decimal => {
  const decA = toPrismaDecimal(a);
  const decB = toPrismaDecimal(b);
  return decA.plus(decB);
};

export const safeSubtract = (a: any, b: any): Prisma.Decimal => {
  const decA = toPrismaDecimal(a);
  const decB = toPrismaDecimal(b);
  return decA.minus(decB);
};

export const safeMultiply = (a: any, b: any): Prisma.Decimal => {
  const decA = toPrismaDecimal(a);
  const decB = toPrismaDecimal(b);
  return decA.times(decB);
};

export const safeDivide = (a: any, b: any): Prisma.Decimal => {
  const decA = toPrismaDecimal(a);
  const decB = toPrismaDecimal(b);
  if (decB.isZero()) return new Prisma.Decimal(0);
  return decA.div(decB);
};
