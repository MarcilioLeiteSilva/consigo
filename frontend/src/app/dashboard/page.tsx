'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import StatCard from '@/components/StatCard';
import api from '@/lib/api';

const mockSalesData = [
  { name: 'Seg', sales: 4000 },
  { name: 'Ter', sales: 3000 },
  { name: 'Qua', sales: 5000 },
  { name: 'Qui', sales: 2780 },
  { name: 'Sex', sales: 1890 },
  { name: 'Sáb', sales: 2390 },
  { name: 'Dom', sales: 3490 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesRes, financialRes] = await Promise.all([
          api.get('/dashboard/sales-summary'),
          api.get('/dashboard/financial-summary')
        ]);
        setStats({
          sales: salesRes.data.data,
          financial: financialRes.data.data
        });
      } catch (err) {
        console.error('Falha ao buscar dados do dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-grid">
      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .chart-section {
          grid-column: span 3;
          background: white;
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid var(--border);
          min-height: 400px;
        }

        .side-section {
          grid-column: span 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .activity-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          flex: 1;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--muted);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .activity-info p {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .activity-info span {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
      `}</style>

      {/* Stats Widgets */}
      <StatCard 
        title="Vendas Totais" 
        value={stats?.sales?.totalSales ? `R$ ${stats.sales.totalSales.toLocaleString()}` : 'R$ 0,00'} 
        icon={TrendingUp} 
        trend="12% vs mês anterior"
      />
      <StatCard 
        title="Itens Vendidos" 
        value={stats?.sales?.totalItems || 0} 
        icon={Package} 
        color="#0ea5e9"
      />
      <StatCard 
        title="Ticket Médio" 
        value={stats?.sales?.ticketMedio ? `R$ ${stats.sales.ticketMedio.toFixed(2)}` : 'R$ 0,00'} 
        icon={ArrowUpRight} 
        color="#a855f7"
      />
      <StatCard 
        title="Saldo Pendente" 
        value={stats?.financial?.pendingBalance ? `R$ ${stats.financial.pendingBalance.toLocaleString()}` : 'R$ 0,00'} 
        icon={Wallet} 
        color="#f59e0b"
      />

      {/* Main Chart */}
      <div className="chart-section glass">
        <div className="card-header">
          <h3 className="card-title">Desempenho de Vendas</h3>
          <select className="input" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={mockSalesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity / Side Section */}
      <div className="side-section">
        <div className="activity-card glass">
          <div className="card-header">
            <h3 className="card-title">Atividade Recente</h3>
            <Clock size={18} className="text-muted-foreground" />
          </div>

          <div className="activity-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon">
                  <ShoppingCart size={16} />
                </div>
                <div className="activity-info">
                  <p>Venda #102{i}</p>
                  <span>Há {i * 15} minutos</span>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.875rem' }}>
                  + R$ {(i * 85).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="btn btn-primary" style={{ width: '100%' }}>
          Gerar Relatório Completo
        </div>
      </div>
    </div>
  );
}

function ShoppingCart({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
