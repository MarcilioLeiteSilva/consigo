'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  DollarSign, 
  Tag,
  MoreVertical,
  ChevronRight,
  Loader2,
  Box,
  Layers
} from 'lucide-react';
import api from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get('/products');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setProducts(data);
      } catch (err: any) {
        console.error('Erro ao carregar produtos', err);
        if (err.response?.status === 401) router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [router]);

  const filteredProducts = products.filter(p => 
    (p?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: any) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0,00' : num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Produtos</h1>
          <p className="text-slate-500 text-sm">Gerencie seu catálogo de impressão 3D e produtos embalados.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 transition-all">
            <Filter size={18} /> Filtrar
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-100">
            <Plus size={20} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Preço</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
                    <p className="text-slate-500 text-sm font-medium">Carregando catálogo...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Box size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{product?.name || 'Sem nome'}</p>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${product?.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {product?.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{product?.sku || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-blue-400" />
                        <span className="text-sm font-medium text-slate-600">{product?.category?.name || 'Geral'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-bold text-slate-900">R$ {formatCurrency(product?.salePrice)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Box size={32} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">Nenhum produto cadastrado</p>
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
