'use client';

import { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  MapPin, 
  User, 
  Power, 
  MoreVertical, 
  TrendingUp, 
  Package,
  Activity,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

export default function POSPage() {
  const [posList, setPosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPOSData() {
      try {
        const response = await api.get('/pos');
        setPosList(response.data);
      } catch (err) {
        console.error('Erro ao carregar PDVs', err);
      } finally {
        setLoading(false);
      }
    }
    loadPOSData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pontos de Venda</h1>
          <p className="text-slate-500">Gerencie seus locais de venda e estoque externo.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200">
          <Plus size={20} />
          Adicionar PDV
        </button>
      </div>

      {/* Stats Summary for POS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Pontos</p>
            <p className="text-2xl font-bold text-slate-900">{posList.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">PDVs Ativos</p>
            <p className="text-2xl font-bold text-slate-900">{posList.filter(p => p.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Mercadoria em Trânsito</p>
            <p className="text-2xl font-bold text-slate-900">1.240 un</p>
          </div>
        </div>
      </div>

      {/* POS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posList.length > 0 ? posList.map((pos) => (
          <div key={pos.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pos.isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Store size={24} />
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pos.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                    <MapPin size={14} />
                    <span>{pos.location || 'Localização não definida'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4 border-y border-slate-50">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vendas Mês</p>
                    <p className="text-sm font-bold text-slate-900">R$ 3.450,00</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estoque</p>
                    <p className="text-sm font-bold text-slate-900">142 itens</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pos.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-bold text-slate-600">{pos.isActive ? 'Em Operação' : 'Inativo'}</span>
                  </div>
                  <button className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline">
                    Ver Dashboard
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User size={14} />
                <span>Responsável: {pos.manager || 'Não definido'}</span>
              </div>
              <button title={pos.isActive ? "Desativar" : "Ativar"} className={`p-1.5 rounded-lg transition-colors ${pos.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                <Power size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Store className="mx-auto w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-600 font-bold">Nenhum PDV cadastrado</h3>
            <p className="text-slate-400 text-sm mt-1">Comece adicionando seu primeiro ponto de venda.</p>
            <button className="mt-6 bg-white border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
              Criar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
