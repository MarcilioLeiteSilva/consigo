'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Calendar, 
  Store, 
  Package, 
  FileText,
  Loader2,
  ChevronRight,
  TrendingUp,
  Clock,
  Printer
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function SaleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await api.get(`/sales/${params.id}`);
        setSale(response.data.data);
      } catch (err) {
        console.error('Falha ao buscar detalhes da venda', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSale();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
          <ShoppingCart size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Movimentação não encontrada</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto font-bold">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Detalhes da Venda #{sale.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                Concluída
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Clock size={14} className="text-slate-400" /> {formatDate(sale.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-sm">
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Store size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ponto de Venda</p>
            <p className="text-xl font-bold text-slate-900">{sale.pos?.name || 'Venda Direta'}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Local: {sale.pos?.city || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Valor Bruto</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(sale.totalAmount)}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">Total Recebido</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-blue-500/20 transition-all" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 relative z-10">
            <FileText size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Itens Vendidos</p>
            <p className="text-2xl font-black text-white">{sale.items?.length || 0} Produtos</p>
            <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-tighter">Movimentação de Estoque</p>
          </div>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 uppercase tracking-tighter">
          <Package className="text-blue-600" /> Itens da Venda
        </h3>
        
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantidade</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Unitário</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Comissão</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sale.items?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all overflow-hidden">
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.product?.name || 'Produto Removido'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">SKU: {item.product?.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-600">{item.quantity}</td>
                    <td className="px-8 py-6 text-center font-bold text-slate-900">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100">
                        {item.commissionPercent}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-black text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Líquido: {formatCurrency(item.consignorAmount)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/30">
                  <td colSpan={4} className="px-8 py-6 text-right text-sm font-bold text-slate-500 uppercase">Total da Venda</td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(sale.totalAmount)}</p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
