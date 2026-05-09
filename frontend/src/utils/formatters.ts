/**
 * Utilitários de formatação para o Frontend.
 * Centraliza a lógica de exibição para evitar inconsistências e erros de NaN.
 */

export const formatCurrency = (value: string | number | null | undefined): string => {
  const num = safeNumber(value);
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatPercent = (value: string | number | null | undefined): string => {
  const num = safeNumber(value);
  return `${num.toFixed(2)}%`;
};

export const safeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return 0;
  return num;
};
