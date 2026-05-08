'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  User, 
  Lock, 
  Globe, 
  ChevronLeft,
  Loader2,
  Zap
} from 'lucide-react';
import api from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    slug: '',
    document: '',
    adminName: '',
    adminPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'companyName' && step === 1) {
      setFormData(prev => ({ 
        ...prev, 
        slug: value.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      }));
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post('/onboarding/register', formData);
      alert('Conta Trial criada com sucesso! Você será redirecionado para o login.');
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[32px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        
        {/* Sidebar Info */}
        <div className="lg:col-span-2 bg-blue-600 p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center font-bold">C</div>
              <span className="font-bold text-xl tracking-tight">Consigo</span>
            </Link>
            <h2 className="text-3xl font-bold mb-6 leading-tight">Comece sua jornada hoje.</h2>
            <p className="text-blue-100 mb-12 leading-relaxed">Experimente o Consigo grátis por 7 dias e transforme sua gestão.</p>
            <div className="space-y-6">
              {[
                { step: 1, label: 'Dados da Empresa' },
                { step: 2, label: 'Conta Administradora' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                    step >= s.step ? 'bg-white text-blue-600 border-white' : 'border-blue-400 text-blue-400'
                  }`}>
                    {step > s.step ? <CheckCircle2 size={16} /> : s.step}
                  </div>
                  <span className={`text-sm font-bold ${step >= s.step ? 'text-white' : 'text-blue-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-50"></div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sua Empresa</h3>
                <p className="text-slate-500 text-sm">Conte-nos um pouco sobre o seu negócio.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome da Empresa</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ex: Joias do Sol LTDA" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Endereço do Sistema (Slug)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input name="slug" value={formData.slug} onChange={handleChange} placeholder="seu-negocio" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-mono" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">.consigo.com</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documento (CPF/CNPJ)</label>
                  <input name="document" value={formData.document} onChange={handleChange} placeholder="00.000.000/0001-00" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!formData.companyName || !formData.slug} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100">Próximo Passo <ArrowRight size={20} /></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm font-bold transition-colors"><ChevronLeft size={18} /> Voltar</button>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sua Conta</h3>
                <p className="text-slate-500 text-sm">Defina seus dados de acesso para começar grátis.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input name="adminName" value={formData.adminName} onChange={handleChange} placeholder="Ex: João Silva" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail de Acesso</label>
                  <input name="email" value={formData.email} onChange={handleChange} placeholder="joao@exemplo.com" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-center">
                <Zap className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">Você começará no <strong>Plano Bronze</strong> com 7 dias de teste gratuito.</p>
              </div>

              <button onClick={handleRegister} disabled={loading || !formData.email || !formData.adminPassword} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-emerald-100">
                {loading ? <Loader2 className="animate-spin" /> : 'Finalizar e Começar Agora'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
