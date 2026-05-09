'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  Search, 
  Package, 
  Store, 
  AlertTriangle,
  ArrowUpRight,
  Loader2, 
  Filter,
  BarChart3,
  Archive,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';

export default function StockPage() {
  const router = useRouter();
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStock = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/stock');
      setStock(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar estoque:', err);
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [router]);

  const filteredStock = stock.filter(item => 
    (item?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral de Estoque</h1>
          <p className="text-slate-500 text-sm">Acompanhe a disponibilidade de produtos em toda a rede.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/dashboard/lots')}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition-all"
          >
            <ArrowUpRight size={20} className="text-blue-500" /> Movimentar Estoque
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Archive size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</p>
            <p className="text-3xl font-black text-slate-900">
              {stock.reduce((acc, item) => acc + item.totalStock, 0)}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Baixo</p>
            <p className="text-3xl font-black text-slate-900">
              {stock.filter(item => item.totalStock < 5).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Package size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKUs Ativos</p>
            <p className="text-3xl font-black text-slate-900">{stock.length}</p>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou SKU..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantidade Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Calculando níveis de estoque...</p>
                  </td>
                </tr>
              ) : filteredStock.length > 0 ? (
                filteredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Consignado em rede</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                        {item.sku || 'S/ SKU'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-xl font-black ${item.totalStock < 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.totalStock}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">UN</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {item.totalStock === 0 ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-100">
                          Esgotado
                        </span>
                      ) : item.totalStock < 5 ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">
                          Baixo Estoque
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                          Estável
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => router.push(`/dashboard/lots?product=${item.id}`)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-xl transition-all"
                        >
                          Ver Lotes <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Database size={40} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg">Nenhum estoque encontrado</p>
                        <p className="text-slate-500 text-sm">Registre lotes para que os produtos apareçam aqui.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
