'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  BarChart3, 
  ShieldCheck, 
  Store, 
  Zap,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">C</div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Consigo</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <Link href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</Link>
              <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">Como Funciona</Link>
              <Link href="#pricing" className="hover:text-blue-600 transition-colors">Planos</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Acessar Conta</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 animate-fade-in">
            <Zap size={14} />
            <span>NOVO: GESTÃO MULTI-TENANT ESCALÁVEL</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Domine a Gestão de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Consignados</span> com Inteligência
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-600 mb-12 leading-relaxed">
            A plataforma completa para consignadores gerenciarem estoque, vendas em PDVs parceiros e financeiro em um só lugar. Simples, seguro e escalável.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:scale-105">
              Criar minha conta agora
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              Acessar Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-40 bottom-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-3xl shadow-2xl border border-slate-200 max-w-5xl mx-auto opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Tudo o que você precisa para crescer</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Funcionalidades pensadas para quem vive de consignação e busca profissionalismo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Package size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Gestão de Estoque</h3>
              <p className="text-slate-600 leading-relaxed">Controle total de entradas, saídas e lotes por PDV com rastreabilidade FIFO completa.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Dashboard Financeiro</h3>
              <p className="text-slate-600 leading-relaxed">Visualize lucros, comissões e saldo disponível em tempo real com extratos imutáveis.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <Store size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Multi-PDVs</h3>
              <p className="text-slate-600 leading-relaxed">Gerencie múltiplos pontos de venda em uma única conta, isolando estoque por localidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Planos que acompanham seu ritmo</h2>
            <p className="text-slate-600">Escolha o plano ideal para o momento do seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Bronze', price: '99', users: '3', pos: '1', products: '50' },
              { name: 'Prata', price: '199', users: '10', pos: '5', products: '500', popular: true },
              { name: 'Ouro', price: '399', users: '99', pos: '20', products: '5000' }
            ].map((plan) => (
              <div key={plan.name} className={`p-10 rounded-3xl border ${plan.popular ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200'} relative`}>
                {plan.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Mais Popular</span>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">R${plan.price}</span>
                  <span className="text-slate-500 font-medium">/mês</span>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    Até {plan.users} usuários internos
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    Até {plan.pos} Pontos de Venda
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    Até {plan.products} produtos no catálogo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    Suporte especializado
                  </li>
                </ul>

                <Link href="/register" className={`block text-center py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-12 mb-12 gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
              <span className="text-xl font-bold text-white">Consigo</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-white transition-colors">Contato</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs gap-4">
            <p>&copy; 2026 Consigo SaaS S.A. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Globe size={14} />
              <span>Orgulhosamente brasileiro 🇧🇷</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
