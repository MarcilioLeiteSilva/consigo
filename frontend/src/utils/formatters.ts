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

export const formatOnlyDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/D';
  
  let d: Date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Se for apenas YYYY-MM-DD, força meio-dia para evitar problemas de fuso
    d = new Date(date + 'T12:00:00');
  } else {
    d = new Date(date);
  }

  // Se a data for válida mas o horário for 00:00 UTC, ela pode retroceder 1 dia no fuso local (ex: Brasil UTC-3)
  // Para formatOnlyDate, queremos o dia nominal.
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC', // Usar UTC para o dia nominal se for uma data pura
  }).format(d);
};
