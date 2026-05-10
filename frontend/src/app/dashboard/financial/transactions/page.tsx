'use client';

import { 
  DollarSign, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Download,
  Wallet
} from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-widest border border-blue-100">
              Módulo Financeiro (Add-on)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Extrato Geral</h1>
          <p className="text-slate-500 text-sm">Histórico completo de todas as movimentações financeiras do tenant.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download size={20} /> Exportar
          </button>
        </div>
      </div>

      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Saldo em Conta</p>
          </div>
          <div className="text-3xl font-black">R$ 24.850,00</div>
          <p className="text-indigo-200 text-xs mt-2 font-medium">Atualizado há 5 min</p>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowUpRight size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Entradas (Mês)</p>
          </div>
          <div className="text-3xl font-black text-slate-900">R$ 18.200,00</div>
          <p className="text-emerald-500 text-xs mt-2 font-bold">+12% vs mês anterior</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <ArrowDownRight size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Saídas (Mês)</p>
          </div>
          <div className="text-3xl font-black text-slate-900">R$ 4.350,00</div>
          <p className="text-slate-400 text-xs mt-2 font-medium">Pagamentos e retiradas</p>
        </div>
      </div>

      {/* Tabela de Transações Placeholder */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar transação..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all">
            <Calendar size={18} /> Filtrar Período
          </button>
        </div>
        
        <div className="p-20 text-center">
          <p className="text-slate-400 font-medium">Selecione um período para visualizar as movimentações financeiras detalhadas.</p>
        </div>
      </div>
    </div>
  );
}
