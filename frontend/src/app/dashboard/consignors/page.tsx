'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Wallet,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ConsignorsPage() {
  const [consignors, setConsignors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConsignors = async () => {
      try {
        const response = await api.get('/consignors');
        setConsignors(response.data.data);
      } catch (err) {
        console.error('Falha ao buscar consignadores', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsignors();
  }, []);

  const filteredConsignors = consignors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .consignors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .consignor-card {
          padding: 1.5rem;
          border-radius: 1.25rem;
          background: white;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .consignor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
        }

        .info h3 {
          font-size: 1.125rem;
          margin-bottom: 0.25rem;
        }

        .info p {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .balance-section {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
          font-weight: 700;
        }

        .balance-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--foreground);
          font-family: 'Outfit', sans-serif;
        }

        .card-footer {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          flex: 1;
        }
      `}</style>

      <div className="actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar consignador..." 
            className="input" 
            style={{ paddingLeft: '2.75rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary">
          <Plus size={18} /> Novo Consignador
        </button>
      </div>

      <div className="consignors-grid">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="consignor-card glass" style={{ height: '200px' }}>Carregando...</div>)
        ) : filteredConsignors.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--muted-foreground)' }}>Nenhum consignador cadastrado.</p>
          </div>
        ) : (
          filteredConsignors.map((consignor) => (
            <motion.div 
              key={consignor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="consignor-card"
            >
              <div className="card-header">
                <div className="avatar">
                  {consignor.name.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="info">
                  <h3>{consignor.name}</h3>
                  <p><Mail size={12} /> {consignor.email || 'N/A'}</p>
                  <p><Phone size={12} /> {consignor.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="balance-section">
                <div>
                  <p className="balance-label">Saldo Pendente</p>
                  <p className="balance-value">R$ {Number(consignor.account?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpRight size={20} />
                </div>
              </div>

              <div className="card-footer">
                <button className="btn btn-outline btn-sm">
                  Ver Extrato
                </button>
                <button className="btn btn-primary btn-sm">
                  Pagar <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
