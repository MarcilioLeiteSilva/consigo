'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CheckCircle2, 
  Store, 
  Calendar, 
  Clock, 
  FileText,
  Loader2,
  ChevronRight,
  Package
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatOnlyDate } from '@/utils/formatters';
import { CurrencyText } from '@/components/CurrencyText';

export default function SettlementReportPage() {
  const params = useParams();
  const router = useRouter();
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettlement = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/settlements/${params.id}`);
        setSettlement(response.data.data || response.data);
      } catch (err) {
        console.error('Erro ao carregar relatório de fechamento:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadSettlement();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Fechamento não encontrado</h2>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold hover:underline">Voltar</button>
      </div>
    );
  }

  const itemsCount = settlement.saleItems?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Relatório de Fechamento</h1>
            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Processado com sucesso
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> Imprimir
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
          >
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none max-w-4xl mx-auto">
        
        {/* Report Header */}
        <div className="p-10 md:p-16 border-b-2 border-dashed border-slate-100 flex flex-col md:flex-row justify-between gap-10 bg-slate-50/50">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">C</div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Consigo SaaS</h2>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ponto de Venda</p>
              <p className="text-xl font-bold text-slate-900">{settlement.pos?.name}</p>
              <p className="text-sm text-slate-500 font-medium">{settlement.pos?.city} - {settlement.pos?.state}</p>
            </div>
          </div>

          <div className="text-left md:text-right space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento de Acerto</p>
              <p className="text-lg font-black text-slate-900 uppercase">#{settlement.id.slice(0, 8)}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Acerto</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(settlement.settledAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período de Referência</p>
                <p className="text-sm font-bold text-slate-700">
                   {settlement.startDate ? formatOnlyDate(settlement.startDate) : 'N/D'} a {settlement.endDate ? formatOnlyDate(settlement.endDate) : 'N/D'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-10 md:p-16 space-y-10">
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Detalhamento de Itens
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase">Produto / Referência</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-center">Quant.</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-right">Unitário</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-right">Comissão</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase text-right">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {settlement.saleItems?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-6">
                        <p className="font-bold text-slate-900">{item.product?.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">SKU: {item.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="py-6 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="py-6 text-right font-bold text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-6 text-right font-medium text-rose-500">-{item.commissionPercent}%</td>
                      <td className="py-6 text-right font-black text-slate-900">{formatCurrency(item.consignorAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer / Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 pt-10 border-t border-slate-100">
            <div className="max-w-xs space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</p>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                {settlement.notes || "Nenhuma observação registrada para este fechamento."}
              </p>
            </div>

            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500">Quantidade de Itens</span>
                <span className="text-sm font-black text-slate-900">{itemsCount}</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-slate-900 rounded-[24px] text-white">
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total a Receber</p>
                  <p className="text-xs font-medium text-indigo-400 italic">Líquido para o Consignador</p>
                </div>
                <div className="text-2xl font-black">
                  <CurrencyText value={settlement.totalAmount} />
                </div>
              </div>
            </div>
          </div>

          {/* Signature Area - Only on Print */}
          <div className="hidden print:grid grid-cols-2 gap-20 pt-20">
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 pt-2">
                <p className="text-xs font-bold text-slate-900">{settlement.pos?.responsibleName || 'Responsável PDV'}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black">{settlement.pos?.name}</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 pt-2">
                <p className="text-xs font-bold text-slate-900">Administrador Consigo</p>
                <p className="text-[9px] text-slate-400 uppercase font-black">Conferido e Validado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:hidden {
            display: none !important;
          }
          .bg-white.rounded-\[40px\] {
             visibility: visible;
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
          }
          .bg-white.rounded-\[40px\] * {
            visibility: visible;
          }
          aside, nav, header {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
