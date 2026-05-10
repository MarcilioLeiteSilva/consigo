'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Layers, 
  Package, 
  Store, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Clock,
  History,
  Tag,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';
import { formatCurrency, formatPercent } from '@/utils/formatters';

export default function LotDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLot = async () => {
      try {
        const res = await api.get(`/consignment-lots/${id}`);
        setLot(res.data.data || res.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes do lote:', err);
        router.push('/dashboard/lots');
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lot) return null;

  const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
  const sellPercent = Math.round((lot.quantitySold / lot.quantityReceived) * 100);
  const totalRevenue = lot.quantitySold * lot.unitPrice;
  const consignorShare = totalRevenue * (1 - (lot.commissionPercent / 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded tracking-widest border border-indigo-100">
                Lote de Consignação
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{lot.product?.name}</h1>
            </div>
            <p className="text-slate-500 text-sm">Rastreamento e análise detalhada do estoque.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/dashboard/lots?id=${lot.id}`)}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            Editar Lote
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Estoque Atual" 
          value={`${available} un`} 
          subValue={`${lot.quantityReceived} originais`}
          icon={<Layers className="text-indigo-600" size={24} />}
          color="indigo"
        />
        <StatCard 
          label="Taxa de Venda" 
          value={`${sellPercent}%`} 
          subValue={`${lot.quantitySold} unidades vendidas`}
          icon={<TrendingUp className="text-emerald-600" size={24} />}
          color="emerald"
        />
        <StatCard 
          label="Receita Gerada" 
          value={<CurrencyText value={totalRevenue} />} 
          subValue="Vendas brutas"
          icon={<DollarSign className="text-amber-600" size={24} />}
          color="amber"
        />
        <StatCard 
          label="Saldo Consignador" 
          value={<CurrencyText value={consignorShare} />} 
          subValue="Após comissões"
          icon={<CheckCircle2 className="text-blue-600" size={24} />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalhes Técnicos */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Info size={20} className="text-indigo-600" />
              Especificações do Lote
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <DetailRow label="Referência" value={lot.reference || 'Nenhuma informada'} icon={<Tag size={18} />} />
              <DetailRow label="Data de Recebimento" value={new Date(lot.receivedAt).toLocaleString()} icon={<Clock size={18} />} />
              <DetailRow label="Ponto de Venda" value={lot.pos?.name || 'Estoque Central'} icon={<Store size={18} />} />
              <DetailRow label="Localização" value={`${lot.pos?.city || '-'} / ${lot.pos?.state || '-'}`} icon={<Package size={18} />} />
              <DetailRow label="Preço Unitário" value={<CurrencyText value={lot.unitPrice} />} icon={<DollarSign size={18} />} />
              <DetailRow label="Comissão do PDV" value={formatPercent(lot.commissionPercent)} icon={<Percent size={18} />} />
            </div>
            
            {lot.notes && (
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Observações</p>
                <p className="text-slate-600 leading-relaxed">{lot.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              Análise de Movimentação
            </h3>
            <div className="space-y-4">
              <ProgressBar label="Vendas Realizadas" current={lot.quantitySold} total={lot.quantityReceived} color="emerald" />
              <ProgressBar label="Devoluções / Perdas" current={lot.quantityReturned} total={lot.quantityReceived} color="amber" />
              <ProgressBar label="Estoque Residual" current={available} total={lot.quantityReceived} color="indigo" />
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Info */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-xl font-bold mb-6">Status da Consignação</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Condição</p>
                  <p className="font-bold">{sellPercent >= 100 ? 'Lote Liquidado' : 'Em Comercialização'}</p>
                </div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <p className="text-xs text-indigo-100 mb-1">Dica de Gestão</p>
                <p className="text-sm">
                  {sellPercent > 80 
                    ? "Este lote está quase esgotado. Considere preparar uma reposição para este PDV." 
                    : "Lote com boa margem de estoque. Monitore o ritmo de vendas nos próximos 7 dias."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ações do Sistema</h3>
            <div className="space-y-3">
              <button 
                disabled
                className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-100 cursor-not-allowed text-sm"
              >
                Imprimir Etiqueta do Lote
              </button>
              <button 
                disabled
                className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-100 cursor-not-allowed text-sm"
              >
                Gerar Relatório de Fechamento
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-4 uppercase font-black tracking-widest">Novas funções em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 border-indigo-100",
    emerald: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
    blue: "bg-blue-50 border-blue-100"
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center mb-4 border`}>
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <div className="text-2xl font-black text-slate-900 mb-1">{value}</div>
      <p className="text-slate-400 text-xs font-medium">{subValue}</p>
    </div>
  );
}

function DetailRow({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

function ProgressBar({ label, current, total, color }: any) {
  const percent = Math.round((current / total) * 100);
  const colors: any = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-xs font-black text-slate-400 uppercase">{current} / {total} ({percent}%)</p>
      </div>
      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div 
          className={`h-full ${colors[color]} transition-all duration-1000`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
