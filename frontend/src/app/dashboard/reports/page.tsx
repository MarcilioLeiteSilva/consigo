'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Store,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '@/lib/api';

const MOCK_POS = [
  { name: 'Loja Centro - Matrix', sales: 12450, growth: 15 },
  { name: 'Quiosque Shopping 1', sales: 8900, growth: 8 },
  { name: 'Papelaria Central', sales: 7200, growth: -2 },
  { name: 'Mercado do Vale', sales: 6500, growth: 12 },
  { name: 'Banca do João', sales: 4200, growth: 5 },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [topPos, setTopPos] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [productsByPos, setProductsByPos] = useState<any[]>([]);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [mRes, pRes, tpRes, ppRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/top-pos'),
          api.get('/dashboard/top-products'),
          api.get('/dashboard/top-products-by-pos'),
        ]);
        setMetrics(mRes.data.data || mRes.data);
        const posData = pRes.data.data || pRes.data || [];
        setTopPos(posData.length > 0 ? posData : MOCK_POS);
        setTopProducts(tpRes.data.data || tpRes.data || []);
        setProductsByPos(ppRes.data.data || ppRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados de relatórios', err);
        setTopPos(MOCK_POS);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const faturamento = metrics?.salesMonth
    ? Number(metrics.salesMonth).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    : 'R$ 45.280';
  const vendasCount = metrics?.salesCountMonth ?? '1.240';
  const activePosCount = metrics?.activePosCount ?? 24;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} /> Relatórios & Inteligência
          </h1>
          <p className="text-slate-500 font-medium mt-1">Analise o desempenho das suas vendas e o giro de estoque.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={20} /> Maio / 2026
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Faturamento Total</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{faturamento}</h3>
            <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +12% este mês
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vendas Realizadas</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{vendasCount}</h3>
            <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +5% este mês
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Giro de Estoque</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">82%</h3>
            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 mt-1">
              Estável vs Abril
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">PDVs Ativos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activePosCount}</h3>
            <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +2 novos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Melhores PDVs */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <TrendingUp className="text-blue-600" /> Top 5 PDVs (Vendas)
            </h3>
            <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          
          <div className="space-y-6">
            {topPos.map((pdv, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{pdv.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{Number(pdv.sales).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className={`text-[10px] font-bold ${(pdv.growth ?? 0) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {(pdv.growth ?? 0) > 0 ? '+' : ''}{pdv.growth ?? 0}% vs mês ant.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias mais Vendidas */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <PieChart className="text-emerald-600" /> Mix de Categorias
            </h3>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full space-y-8 pb-10">
            <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 leading-none">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Média Geral</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm font-bold text-slate-600">Impressões 3D (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-sm font-bold text-slate-600">Revenda (30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm font-bold text-slate-600">Insumos (15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="text-sm font-bold text-slate-600">Outros (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Produtos Mais Vendidos ── */}
      {topProducts.length > 0 && (() => {
        const total = topProducts.reduce((a, p) => a + (p.quantity || 0), 0);
        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const pieData = topProducts.slice(0, 5).map((p) => ({
          name: p.name,
          value: p.quantity || 0,
        }));

        return (
          <>
            {/* Título da seção */}
            <div className="flex items-center gap-3 pt-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Produtos Mais Vendidos</h2>
                <p className="text-slate-400 text-xs font-bold">Ranking geral e por PDV</p>
              </div>
            </div>

            {/* Lista + Pizza */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lista */}
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                  <TrendingUp className="text-blue-600" /> Ranking de Produtos
                </h3>
                <div className="space-y-5">
                  {topProducts.slice(0, 5).map((p, i) => {
                    const pct = total > 0 ? Math.round((p.quantity / total) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ background: COLORS[i % 5] }}>
                            {i + 1}
                          </div>
                          <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors text-sm">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{p.quantity} un.</p>
                          <p className="text-[10px] font-bold text-emerald-500">{pct}% do total</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gráfico Pizza */}
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                  <PieChart className="text-emerald-600" /> % por Produto
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} un.`, 'Vendidos']} />
                    <Legend formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico Barras Geral */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                <BarChart3 className="text-blue-600" /> Mais Vendidos — Geral
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} width={140} />
                  <Tooltip formatter={(v: any) => [`${v} un.`, 'Vendidos']} />
                  <Bar dataKey="quantity" radius={[0, 8, 8, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico Barras por PDV */}
            {productsByPos.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {productsByPos.slice(0, 4).map((posData: any, pi: number) => (
                  <div key={pi} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                      <Store size={18} className="text-rose-500" /> {posData.pos}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={posData.products} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} width={100} />
                        <Tooltip formatter={(v: any) => [`${v} un.`, 'Vendidos']} />
                        <Bar dataKey="quantity" radius={[0, 6, 6, 0]} fill={COLORS[pi % COLORS.length]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
