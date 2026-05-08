'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Store,
  AlertTriangle,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import api from '@/lib/api';

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [mRes, cRes, pRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/sales-chart'),
          api.get('/dashboard/top-products')
        ]);
        setMetrics(mRes.data);
        setChartData(cRes.data);
        setTopProducts(pRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Vendas Hoje', value: `R$ ${metrics?.salesToday || 0}`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12.5%' },
    { label: 'Vendas Mês', value: `R$ ${metrics?.salesMonth || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+8.2%' },
    { label: 'Ticket Médio', value: `R$ ${metrics?.avgTicket || 0}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100', trend: '-2.4%' },
    { label: 'Saldo Disponível', value: `R$ ${metrics?.balance || 0}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: null },
    { label: 'Estoque Total', value: `${metrics?.totalStock || 0} un`, icon: Package, color: 'text-slate-600', bg: 'bg-slate-100', trend: null },
    { label: 'PDVs Ativos', value: `${metrics?.activePosCount || 0}`, icon: Store, color: 'text-rose-600', bg: 'bg-rose-100', trend: null },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500">Bem-vindo ao centro de comando da sua operação.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.bg} p-2.5 rounded-xl`}>
                <kpi.icon className={`${kpi.color} w-5 h-5`} />
              </div>
              {kpi.trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Histórico de Vendas</h2>
              <p className="text-sm text-slate-500">Últimos 7 dias de operação</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none">
              <option>Últimos 7 dias</option>
              <option>Este mês</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-slate-900">Top Produtos</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="space-y-6">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.quantity} unidades vendidas</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-emerald-500" />
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-10">Nenhum dado disponível</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
            Ver Todos os Produtos
          </button>
        </div>
      </div>

      {/* Alert Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertTriangle className="text-amber-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-amber-900 font-bold">Estoque Baixo Detectado</h3>
            <p className="text-amber-700 text-sm">3 produtos em seu Quiosque Principal estão abaixo do limite mínimo.</p>
          </div>
          <button className="ml-auto bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Repor Agora</button>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <DollarSign className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold">Fechamento de Ciclo</h3>
            <p className="text-blue-700 text-sm">Seu próximo fechamento financeiro será em 3 dias. Confira os repasses.</p>
          </div>
          <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Ver Detalhes</button>
        </div>
      </div>
    </div>
  );
}
