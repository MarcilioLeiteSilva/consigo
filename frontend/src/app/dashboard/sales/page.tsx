'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Calendar, 
  Download, 
  Eye,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales');
        setSales(response.data.data);
      } catch (err) {
        console.error('Falha ao buscar histórico de vendas', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <div className="page-container">
      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .data-table-container {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--muted-foreground);
          font-weight: 700;
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
        }
      `}</style>

      <div className="actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
            <input type="text" placeholder="Filtrar por ID..." className="input" style={{ paddingLeft: '2.75rem' }} />
          </div>
          <button className="btn btn-outline">
            <Calendar size={18} /> Hoje
          </button>
        </div>

        <button className="btn btn-outline">
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="data-table-container"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>ID da Venda</th>
              <th>Data/Hora</th>
              <th>PDV</th>
              <th>Itens</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Carregando vendas...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Nenhuma venda registrada.</td></tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>#{sale.id.slice(0, 6).toUpperCase()}</span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {new Date(sale.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td>{sale.pos?.name || 'Geral'}</td>
                  <td>{sale.items?.length || 0} itens</td>
                  <td style={{ fontWeight: 800 }}>
                    R$ {Number(sale.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td><span className="status-pill">Concluída</span></td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
