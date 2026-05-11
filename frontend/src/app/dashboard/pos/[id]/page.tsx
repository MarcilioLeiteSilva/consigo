'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Store, 
  ArrowLeft, 
  Calendar, 
  Package, 
  TrendingUp, 
  RefreshCcw, 
  PlusCircle, 
  History,
  Info,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatOnlyDate } from '@/utils/formatters';

export default function POSDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [pos, setPos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMovimentarOpen, setIsMovimentarOpen] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pos/${params.id}`);
      setPos(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes do PDV:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) loadDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!pos) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
          <Store size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">PDV não encontrado</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto font-bold">
          <ArrowLeft size={16} /> Voltar para a lista
        </button>
      </div>
    );
  }

  // Cálculos de resumo
  const totalProbable = pos.consignmentLots?.reduce((acc: number, lot: any) => {
    const quantitySold = lot.quantitySold || 0;
    const unitPrice = Number(lot.unitPrice) || 0;
    const commissionPercent = Number(lot.commissionPercent) || 0;
    return acc + (quantitySold * unitPrice * (1 - commissionPercent / 100));
  }, 0) || 0;

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
              <h1 className="text-3xl font-black text-slate-900">{pos.name}</h1>
              {pos.isActive ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">Ativo</span>
              ) : (
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-100">Inativo</span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {pos.city} - {pos.state} | Responsável: {pos.responsibleName || 'N/D'} | Criado em: {formatOnlyDate(pos.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsMovimentarOpen(!isMovimentarOpen)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-slate-800 transition-all shadow-lg text-sm"
            >
              <RefreshCcw size={18} /> Movimentar
            </button>
            
            {isMovimentarOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50">
                  <ArrowLeft size={16} className="text-amber-500" /> Devolver Produtos
                </button>
                <button 
                  onClick={() => router.push(`/dashboard/lots?posId=${pos.id}&create=true`)}
                  className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                >
                  <PlusCircle size={16} className="text-blue-500" /> Abastecer (Novo Lote)
                </button>
                <button className="w-full text-left px-6 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                  <AlertCircle size={16} /> Registrar Perda
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push(`/dashboard/lots?posId=${pos.id}&create=true`)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 text-sm"
          >
            <PlusCircle size={18} /> Novo Lote
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Calendar size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Período Atual</p>
            <p className="text-xl font-bold text-slate-900">Maio / 2026</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
              <Clock size={10} /> Próxima cobrança: {pos.billingDay ? `${pos.billingDay.toString().padStart(2, '0')}/05` : 'N/D'}
              {pos.isRecurring && <span className="ml-2 text-blue-500 font-black">(RECORRENTE)</span>}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl md:col-span-2 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden group gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Provável Fechamento (Líquido)</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black text-white">
                  {formatCurrency(totalProbable)}
                </span>
                <span className="text-sm font-bold text-blue-400">Pendente de acerto</span>
              </div>
            </div>
          </div>
          <button className="relative z-10 p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all self-end md:self-center">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Produtos Enviados */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <Package className="text-blue-600" /> Produtos Enviados
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full border border-slate-200">
              {pos.consignmentLots?.length || 0} Lotes Ativos
            </span>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Enviado</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vendido</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saldo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pos.consignmentLots?.map((lot: any) => {
                    const currentStock = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
                    return (
                      <tr key={lot.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform">
                              {lot.product?.imageUrl ? (
                                <img src={lot.product.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="text-slate-300" size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{lot.product?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">REF: {lot.reference || 'SEM REF'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-slate-600">{lot.quantityReceived}</td>
                        <td className="px-8 py-6 text-center font-bold text-emerald-600">{lot.quantitySold}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={`font-black px-2 py-1 rounded-lg ${currentStock <= 5 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-900'}`}>
                            {currentStock}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-slate-900">
                          {formatCurrency(lot.unitPrice)}
                        </td>
                      </tr>
                    );
                  })}
                  {(!pos.consignmentLots || pos.consignmentLots.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center gap-3">
                            <Package className="text-slate-200" size={48} />
                            <p className="text-slate-400 font-bold">Nenhum produto enviado para este PDV.</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Movimentações Recentes - Agora em baixo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 uppercase tracking-tighter">
              <History className="text-blue-600" /> Histórico de Movimentações
            </h3>
            
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
              {pos.sales?.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-100">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">Venda Realizada</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(sale.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 leading-tight">{formatCurrency(sale.totalAmount)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">#{sale.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              ))}
              {(!pos.sales || pos.sales.length === 0) && (
                <div className="text-center py-10 flex flex-col items-center gap-3">
                  <History className="text-slate-100" size={40} />
                  <p className="text-slate-400 text-sm font-bold">Nenhuma venda registrada.</p>
                </div>
              )}
              <button className="w-full py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest border-t border-slate-50 mt-4 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
                Ver Histórico Completo <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-[40px] p-8 border border-blue-100 relative overflow-hidden group h-full">
              <div className="absolute -bottom-8 -right-8 text-blue-200/30 transition-transform duration-500 group-hover:scale-110">
                <Info size={140} />
              </div>
              <div className="relative z-10">
                  <h4 className="text-blue-900 font-black text-lg mb-2 flex items-center gap-2">
                    <Info size={20} /> Dica de Gestão
                  </h4>
                  <p className="text-blue-700 text-xs font-bold leading-relaxed opacity-80">
                    Lotes com menos de 5 unidades restantes aparecem em destaque para facilitar o abastecimento proativo de seus parceiros.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
