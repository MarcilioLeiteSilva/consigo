'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Settings, 
  Zap, 
  Clock, 
  Trash2, 
  Plus, 
  Info, 
  TrendingUp,
  DollarSign,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CurrencyText } from '@/components/CurrencyText';

export default function Calc3DPage() {
  const router = useRouter();
  
  const [params, setParams] = useState({
    filamentPrice: 120, // R$ per spool
    filamentWeight: 1000, // grams per spool
    partWeight: 150, // grams
    printTime: 12, // hours
    machinePower: 200, // Watts
    energyCost: 0.85, // R$ per kWh
    machinePrice: 2500, // R$
    machineLife: 5000, // hours
    hourlyRate: 50, // R$ per hour for labor
    laborTime: 1, // hours (post-processing/setup)
    failRate: 10, // %
    profitMargin: 50, // %
  });

  const [results, setResults] = useState({
    filamentCost: 0,
    energyCost: 0,
    machineDepreciation: 0,
    laborCost: 0,
    totalCost: 0,
    markup: 0,
    finalPrice: 0,
    profit: 0
  });

  useEffect(() => {
    // 1. Filament Cost
    const filamentCost = (params.filamentPrice / params.filamentWeight) * params.partWeight;
    
    // 2. Energy Cost
    const energyCost = (params.machinePower / 1000) * params.printTime * params.energyCost;
    
    // 3. Machine Depreciation
    const machineDepreciation = (params.machinePrice / params.machineLife) * params.printTime;
    
    // 4. Labor Cost
    const laborCost = params.hourlyRate * params.laborTime;
    
    // 5. Total Base Cost
    const baseCost = filamentCost + energyCost + machineDepreciation + laborCost;
    
    // 6. Cost with fail rate buffer
    const totalCost = baseCost * (1 + params.failRate / 100);
    
    // 7. Profit and Final Price
    const profit = totalCost * (params.profitMargin / 100);
    const finalPrice = totalCost + profit;

    setResults({
      filamentCost,
      energyCost,
      machineDepreciation,
      laborCost,
      totalCost,
      markup: params.profitMargin,
      finalPrice,
      profit
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
            <Box className="text-blue-600" size={32} /> Calculadora de Custos 3D
          </h1>
          <p className="text-slate-500 font-medium mt-1">Precifique seus produtos impressos com precisão cirúrgica.</p>
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
          {/* Material & Peça */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="text-blue-500" size={20} /> Material & Projeto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço do Filamento (R$/Kg)</label>
                <input 
                  type="number" name="filamentPrice" value={params.filamentPrice} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peso da Peça (gramas)</label>
                <input 
                  type="number" name="partWeight" value={params.partWeight} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Operação & Máquina */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Zap className="text-amber-500" size={20} /> Custos de Operação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempo de Impressão (h)</label>
                <input 
                  type="number" name="printTime" value={params.printTime} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consumo Médio (Watts)</label>
                <input 
                  type="number" name="machinePower" value={params.machinePower} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custo Energia (R$/kWh)</label>
                <input 
                  type="number" step="0.01" name="energyCost" value={params.energyCost} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Hora de Trabalho (R$/h)</label>
                <input 
                  type="number" name="hourlyRate" value={params.hourlyRate} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Setup/Pós (horas)</label>
                <input 
                  type="number" step="0.1" name="laborTime" value={params.laborTime} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Margem & Perda */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> Lucratividade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Margem de Lucro Desejada (%)</label>
                <input 
                  type="number" name="profitMargin" value={params.profitMargin} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-emerald-600 text-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxa de Falha/Buffer (%)</label>
                <input 
                  type="number" name="failRate" value={params.failRate} onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold text-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl space-y-10 sticky top-8">
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Sugestão de Preço Final</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">
                  {results.finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="space-y-6 border-t border-white/10 pt-10">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">Custo Material</span>
                <span className="font-bold">{formatCurrency(results.filamentCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">Energia & Máquina</span>
                <span className="font-bold">{formatCurrency(results.energyCost + results.machineDepreciation)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm font-medium">Mão de Obra</span>
                <span className="font-bold">{formatCurrency(results.laborCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Custo Total Prod.</span>
                <span className="font-black text-rose-400">{formatCurrency(results.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Lucro Estimado</span>
                <span className="font-black text-emerald-400">+{formatCurrency(results.profit)}</span>
              </div>
            </div>

            <div className="bg-blue-600/20 p-6 rounded-3xl border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Info className="text-blue-400" size={20} />
                <p className="text-[10px] font-bold text-blue-200 leading-relaxed uppercase tracking-tighter">
                  Este cálculo inclui amortização da máquina e taxa de falha de {params.failRate}%.
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
