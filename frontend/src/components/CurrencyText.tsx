import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface CurrencyTextProps {
  value: string | number | null | undefined;
  className?: string;
  prefix?: string;
}

/**
 * Componente central para exibição de valores monetários.
 * Impede o uso de toFixed() direto nos componentes e garante formatação pt-BR.
 */
export const CurrencyText: React.FC<CurrencyTextProps> = ({ 
  value, 
  className = '', 
  prefix = '' 
}) => {
  return (
    <span className={className}>
      {prefix}{formatCurrency(value)}
    </span>
  );
};

export default CurrencyText;
