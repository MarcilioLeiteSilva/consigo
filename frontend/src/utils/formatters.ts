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

export const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/D';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
