'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Layers, 
  Database, 
  Store, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  Users, 
  Settings, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel', href: '/dashboard' },
  { icon: Package, label: 'Produtos', href: '/dashboard/products' },
  { icon: Tags, label: 'Categorias', href: '/dashboard/categories' },
  { icon: Database, label: 'Estoque', href: '/dashboard/stock' },
  { icon: Store, label: 'PDVs', href: '/dashboard/pos' },
  { 
    icon: DollarSign, 
    label: 'Financeiro', 
    href: '/dashboard/financial',
    children: [
      { label: 'Extrato Geral', href: '/dashboard/financial' },
      { icon: ClipboardList, label: 'Prestação de Contas', href: '/dashboard/settlements' },
      { icon: ShoppingCart, label: 'Vendas', href: '/dashboard/sales' },
      { icon: BarChart3, label: 'Relatórios', href: '/dashboard/reports' },
      { label: 'Contas a Receber', href: '/dashboard/financial/receivables' },
      { label: 'DRE', href: '/dashboard/financial/dre' },
      { label: 'Calculadora 3D', href: '/dashboard/finance/calc-3d' },
      { label: 'Calculadora Revenda', href: '/dashboard/finance/calc-resale' },
    ]
  },

  { 
    icon: Settings, 
    label: 'Configurações', 
    href: '/dashboard/settings',
    children: [
      { label: 'Meu Perfil', href: '/dashboard/settings' },
      { icon: Users, label: 'Usuários', href: '/dashboard/users' },
    ]
  },
  { 
    icon: Sparkles, 
    label: 'Automação', 
    href: '/dashboard/automation',
    children: [
      { label: 'Agente de Acertos', href: '/dashboard/automation/inventory-agent' },
    ]
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Financeiro']);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-[#0f172a]">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static lg:block",
          isSidebarOpen ? "w-64" : "w-20",
          !isSidebarOpen && "lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            {isSidebarOpen && (
              <span className="ml-3 font-bold text-xl tracking-tight text-blue-600">Consigo</span>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.children?.some(child => pathname === child.href));
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.includes(item.label);
              
              return (
                <div key={item.label} className="space-y-1">
                  <div
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.label);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className={cn(
                      "flex items-center p-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive && !hasChildren
                        ? "bg-blue-50 text-blue-600 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                    {isSidebarOpen && (
                      <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden flex-1">
                        {item.label}
                      </span>
                    )}
                    {hasChildren && isSidebarOpen && (
                      <ChevronRight size={14} className={cn("transition-transform duration-200", isExpanded ? "rotate-90" : "")} />
                    )}
                    {isActive && isSidebarOpen && !hasChildren && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </div>

                  {hasChildren && isSidebarOpen && isExpanded && (
                    <div className="ml-9 space-y-1 border-l border-slate-100 pl-4 py-1 animate-in slide-in-from-top-1 duration-200">
                      {item.children.map((child: any) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block py-2 px-3 text-xs font-medium rounded-lg transition-all",
                              isChildActive 
                                ? "text-blue-600 bg-blue-50/50" 
                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              {child.label}
                              {child.badge && (
                                <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-black uppercase">
                                  {child.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5 min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar em Consigo..." 
                className="bg-transparent border-none outline-none text-xs ml-2 w-48 text-slate-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {user?.name || 'Carregando...'}
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {user?.role || 'Consignador'}
                </p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.name?.substring(0, 1) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
