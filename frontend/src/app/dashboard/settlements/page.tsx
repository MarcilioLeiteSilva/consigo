'use client';

import { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowRight, 
  Store, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function SettlementsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prestação de Contas (Fechamento)</h1>
          <p className="text-slate-500 text-sm">Consolidação de vendas e acerto de contas com PDVs.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100">
          <ClipboardList size={20} /> Novo Fechamento
        </button>
      </div>

      {/* Alerta de Conceito */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 items-start">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 mb-1">Módulo Central de Operação</h4>
          <p className="text-amber-700 text-sm leading-relaxed">
            Este módulo é o núcleo da sua operação. Aqui você valida o que foi vendido vs o que deve ser pago. 
            As movimentações financeiras detalhadas e o histórico de longo prazo são gerenciados pelo <strong>Módulo Financeiro (Add-on)</strong>.
          </p>
        </div>
      </div>

      {/* Stats Simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Aguardando Fechamento</p>
          <div className="text-2xl font-black text-slate-900">12 PDVs</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Pendente (Vendas)</p>
          <div className="text-2xl font-black text-slate-900 text-emerald-600">R$ 14.250,00</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Último Fechamento</p>
          <div className="text-2xl font-black text-slate-900">Ontem, 18:45</div>
        </div>
      </div>

      {/* Listagem de PDVs para Fechamento */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">PDVs com Vendas Pendentes</h3>
          <div className="flex gap-2">
             <button className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100">
               <Filter size={20} />
             </button>
          </div>
        </div>
        
        <div className="p-8 text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4">
            <Clock size={40} />
          </div>
          <h3 className="text-slate-900 font-black text-lg">Módulo em Configuração</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
            Estamos preparando a interface de prestação de contas simplificada. Em breve você poderá selecionar um PDV e liquidar as vendas.
          </p>
        </div>
      </div>
    </div>
  );
}
