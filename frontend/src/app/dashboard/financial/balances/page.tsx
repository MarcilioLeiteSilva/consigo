'use client';

import { Users, Store, ArrowRight, DollarSign } from 'lucide-react';

export default function BalancesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-widest border border-blue-100">
            Módulo Financeiro (Add-on)
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Saldos de Parceiros</h1>
        <p className="text-slate-500 text-sm">Controle de débitos e créditos pendentes por PDV ou fornecedor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder List */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                <Store size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Ponto de Venda #{i}</h3>
                <p className="text-slate-400 text-xs">Último fechamento há {i * 2} dias</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Devedor</p>
              <p className="text-xl font-black text-rose-500">R$ {i * 1250},00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
