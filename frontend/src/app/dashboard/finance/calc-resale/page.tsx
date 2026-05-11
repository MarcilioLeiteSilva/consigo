'use client';

import { useState, useEffect } from 'react';
import { 
  Repeat, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  Truck, 
  Package, 
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CalcResalePage() {
  const router = useRouter();

  const [params, setParams] = useState({
    costPrice: 50.00,
    taxPercent: 4.0, // Simples Nacional etc
    marketplaceFee: 16.0, // ML Premium etc
    fixedFee: 6.0, // R$ per sale
    shippingCost: 0,
    marketingCost: 2.0, // Ads etc
    packagingCost: 1.5,
    profitMargin: 30, // % on sale price
  });

  const [results, setResults] = useState({
    salePrice: 0,
    netProfit: 0,
    taxes: 0,
    fees: 0,
    roi: 0,
    breakEven: 0
  });

  useEffect(() => {
    // Cálculo do preço de venda com base na margem sobre o preço de venda (Markup)
    // PV = (Custo + Frete + Fixo) / (1 - (Imposto + Taxa + Margem))
    
    const costTotal = params.costPrice + params.shippingCost + params.fixedFee + params.marketingCost + params.packagingCost;
    const deductionsPercent = (params.taxPercent + params.marketplaceFee + params.profitMargin) / 100;
    
    let salePrice = 0;
    if (deductionsPercent < 1) {
      salePrice = costTotal / (1 - deductionsPercent);
    } else {
      salePrice = costTotal * 2; // Fallback se as taxas somarem > 100%
    }

    const taxes = salePrice * (params.taxPercent / 100);
    const mktFees = salePrice * (params.marketplaceFee / 100) + params.fixedFee;
    const netProfit = salePrice - params.costPrice - taxes - mktFees - params.shippingCost - params.marketingCost - params.packagingCost;
    const roi = (netProfit / params.costPrice) * 100;
    
    // Ponto de equilíbrio (Lucro 0)
    const breakEvenDeductions = (params.taxPercent + params.marketplaceFee) / 100;
    const breakEven = costTotal / (1 - breakEvenDeductions);

    setResults({
      salePrice,
      netProfit,
      taxes,
      fees: mktFees,
      roi,
      breakEven
    });
  }, [params]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Repeat className="text-emerald-600" size={32} /> Calculadora de Revenda
          </h1>
          <p className="text-slate-500 font-medium mt-1">Descubra o preço ideal para seus produtos e garanta sua margem.</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custo Base */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="text-emerald-500" size={20} /> Custo de Aquisição
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço de Custo (Unidade)</label>
                <input 
                  type="number" step="0.01" name="costPrice" value={params.costPrice} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-slate-900 text-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frete de Compra (se houver)</label>
                <input 
                  type="number" step="0.01" name="shippingCost" value={params.shippingCost} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Taxas & Plataforma */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Percent className="text-blue-500" size={20} /> Taxas e Marketplace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imposto sobre Venda (%)</label>
                <input 
                  type="number" step="0.1" name="taxPercent" value={params.taxPercent} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comissão Marketplace (%)</label>
                <input 
                  type="number" step="0.1" name="marketplaceFee" value={params.marketplaceFee} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxa Fixa por Venda (R$)</label>
                <input 
                  type="number" step="0.01" name="fixedFee" value={params.fixedFee} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Margem de Lucro Alvo (%)</label>
                <input 
                  type="number" name="profitMargin" value={params.profitMargin} onChange={handleChange}
                  className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-emerald-600 text-xl"
                />
              </div>
            </div>
          </div>

          {/* Outros Custos */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="text-slate-500" size={20} /> Embalagem & Marketing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Embalagem/Brindes (R$)</label>
                <input 
                  type="number" step="0.01" name="packagingCost" value={params.packagingCost} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketing/Ads por Venda (R$)</label>
                <input 
                  type="number" step="0.01" name="marketingCost" value={params.marketingCost} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl space-y-10 sticky top-8">
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Preço de Venda Sugerido</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">
                  {results.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1 uppercase tracking-widest">
                <ShieldCheck size={14} /> Lucro de {results.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} garantido
              </p>
            </div>

            <div className="space-y-6 border-t border-white/10 pt-10">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">Impostos</span>
                <span className="font-bold text-rose-400">-{formatCurrency(results.taxes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">Taxas Marketplace</span>
                <span className="font-bold text-rose-400">-{formatCurrency(results.fees)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">ROI (Retorno s/ Invest.)</span>
                <span className="font-black text-blue-400">{results.roi.toFixed(1)}%</span>
              </div>
              
              <div className="pt-6 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Ponto de Equilíbrio</span>
                  <span className="text-sm font-bold text-amber-500">{formatCurrency(results.breakEven)}</span>
                </div>
                <p className="text-[9px] text-white/30 italic leading-tight">
                  * Venda abaixo deste valor para ter prejuízo.
                </p>
              </div>
            </div>

            <div className="bg-emerald-600/20 p-6 rounded-3xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-400" size={20} />
                <p className="text-[10px] font-bold text-emerald-200 leading-relaxed uppercase tracking-tighter">
                  Sua margem líquida é de {params.profitMargin}% sobre o valor de venda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatCurrency = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
