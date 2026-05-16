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
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [topPos, setTopPos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [mRes, pRes, cRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/top-pos'),
          api.get('/dashboard/sales-by-category')
        ]);
        
        setMetrics(mRes.data.data || mRes.data);
        setTopPos(pRes.data.data || pRes.data || []);
        setCategories(cRes.data.data || cRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados de relatórios', err);
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

  const faturamento = metrics?.salesMonth || 0;
  const vendasCount = metrics?.salesCountMonth || 0;
  const activePos = metrics?.activePosCount || 0;
  const totalStock = metrics?.totalStock || 0;

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
            <Calendar size={20} /> {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
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
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {Number(faturamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </h3>
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
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activePos}</h3>
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
            {topPos.length > 0 ? topPos.map((pdv, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{pdv.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{Number(pdv.sales).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-[10px] font-bold text-emerald-500">
                    +15% vs mês ant.
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-300">
                <p className="text-xs font-bold uppercase tracking-widest">Aguardando dados...</p>
              </div>
            )}
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
                <p className="text-3xl font-black text-slate-900 leading-none">
                  {categories.length > 0 ? '100%' : '0%'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Média Geral</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
              {categories.length > 0 ? categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-300', 'bg-rose-500'][i % 5]}`} />
                  <span className="text-sm font-bold text-slate-600">{cat.name} ({cat.percentage}%)</span>
                </div>
              )) : (
                <p className="text-center col-span-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">Nenhuma categoria registrada</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
