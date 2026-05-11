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
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function StockPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'geral' | 'rede'>('geral');
  const [stock, setStock] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantityReceived: '',
    unitPrice: '',
    commissionPercent: '0',
    reference: '',
    notes: ''
  });

  const loadStock = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/stock');
      setStock(Array.isArray(response.data) ? response.data : response.data?.data || []);
      
      const prodRes = await api.get('/products');
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/consignment-lots', {
        ...formData,
        quantityReceived: parseInt(formData.quantityReceived),
        posId: null
      });
      setIsModalOpen(false);
      setFormData({ productId: '', quantityReceived: '', unitPrice: '', commissionPercent: '0', reference: '', notes: '' });
      loadStock();
    } catch (err) {
      console.error('Erro ao incluir produto no estoque:', err);
      alert('Falha ao incluir produto. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStock = stock.filter(item => {
    const searchMatch = (item?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item?.sku || '').toLowerCase().includes(search.toLowerCase());
    
    if (activeView === 'geral') return searchMatch && item.generalStock > 0;
    return searchMatch && item.networkStock > 0;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Estoque</h1>
          <p className="text-slate-500 text-sm">Controle centralizado e distribuição para a rede.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Archive size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral</p>
          <p className="text-2xl font-black text-slate-900">
            {stock.reduce((acc, item) => acc + (item.generalStock || 0), 0)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <Store size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total na Rede</p>
          <p className="text-2xl font-black text-slate-900">
            {stock.reduce((acc, item) => acc + (item.networkStock || 0), 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Package size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Consolidado</p>
          <p className="text-2xl font-black text-slate-900">
            {stock.reduce((acc, item) => acc + (item.totalStock || 0), 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abaixo do Mínimo</p>
          <p className="text-2xl font-black text-slate-900">
            {stock.filter(item => (item.generalStock || 0) < 5).length}
          </p>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 flex items-center justify-between border-b border-slate-50 flex-wrap gap-4">
          <div className="flex gap-12">
            <button 
              onClick={() => setActiveView('geral')}
              className={`pb-4 text-xl font-black uppercase tracking-tight transition-all border-b-4 ${activeView === 'geral' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Estoque Geral
            </button>
            <button 
              onClick={() => setActiveView('rede')}
              className={`pb-4 text-xl font-black uppercase tracking-tight transition-all border-b-4 ${activeView === 'rede' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Estoque na Rede
            </button>
          </div>
        </div>

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

          <div>
            {activeView === 'geral' ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 text-sm"
              >
                <PlusCircle size={20} /> Incluir Produtos - Estoque Central
              </button>
            ) : (
              <button 
                onClick={() => router.push('/dashboard/lots')}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-800 transition-all shadow-lg text-sm"
              >
                <ArrowUpRight size={20} /> Abastecer Rede
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qtd. no {activeView === 'geral' ? 'Geral' : 'PDV'}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Processando inventário...</p>
                  </td>
                </tr>
              ) : filteredStock.length > 0 ? (
                filteredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {activeView === 'geral' ? 'Disponível para envio' : 'Consignado em rede'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                        {item.sku || 'S/ SKU'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-xl font-black ${ (activeView === 'geral' ? item.generalStock : item.networkStock) < 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {activeView === 'geral' ? item.generalStock : item.networkStock}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">UN</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {(activeView === 'geral' ? item.generalStock : item.networkStock) === 0 ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-100">
                          Esgotado
                        </span>
                      ) : (activeView === 'geral' ? item.generalStock : item.networkStock) < 5 ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-rose-100">
                          Crítico
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                          Abastecido
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => router.push(activeView === 'geral' ? `/dashboard/stock/lots?product=${item.id}` : `/dashboard/lots?product=${item.id}`)}
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
                        <p className="text-slate-900 font-black text-lg">Nenhum estoque nesta visão</p>
                        <p className="text-slate-500 text-sm">Altere o filtro ou realize movimentações.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Incluir Produtos */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Incluir Produtos</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estoque Central</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Produto</label>
                <select 
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku || 'S/ SKU'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    placeholder="0"
                    value={formData.quantityReceived}
                    onChange={(e) => setFormData({...formData, quantityReceived: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço de Custo (Un)</label>
                  <input 
                    required
                    type="text"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referência (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ex: Lote Junho/26"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
