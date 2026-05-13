'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  LogOut,
  Sparkles,
  BarChart3,
  ChevronDown,
  Calculator,
  Box,
  Repeat,
  Bot,
  MessageSquare
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Vendas', href: '/dashboard/sales' },
  { icon: Package, label: 'Produtos', href: '/dashboard/products' },
  { icon: Users, label: 'Consignadores', href: '/dashboard/consignors' },
  { 
    icon: Wallet, 
    label: 'Financeiro', 
    href: '/dashboard/finance',
    children: [
      { icon: Calculator, label: 'Geral', href: '/dashboard/finance' },
      { icon: Box, label: 'Calculadora 3D', href: '/dashboard/finance/calc-3d' },
      { icon: Repeat, label: 'Calculadora Revenda', href: '/dashboard/finance/calc-resale' },
    ]
  },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/reports' },
  { 
    icon: Sparkles, 
    label: 'Automação', 
    href: '/dashboard/automation',
    children: [
      { icon: Bot, label: 'Agente de Acertos', href: '/dashboard/automation/inventory-agent' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Financeiro']);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  return (
    <aside className="sidebar glass">
      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          border-right: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.4);
        }

        [data-theme='dark'] .sidebar {
          background: rgba(15, 23, 42, 0.4);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.75rem 3rem;
        }

        .logo-icon {
          background: var(--gradient-primary);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.5px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          color: var(--muted-foreground);
          font-weight: 500;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(99, 102, 241, 0.05);
          color: var(--primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .submenu {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-left: 1.5rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--border);
        }

        .sub-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sub-item:hover {
          color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .sub-item.active {
          color: var(--primary);
          font-weight: 700;
        }

        .footer {
          margin-top: auto;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .logout-btn {
          color: #ef4444;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
        }
      `}</style>

      <div className="logo">
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>
        <span className="logo-text">Consigo</span>
      </div>

      <nav className="nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.children?.some(c => pathname === c.href));
          const isExpanded = expandedMenus.includes(item.label);

          if (item.children) {
            return (
              <div key={item.label}>
                <button 
                  onClick={() => toggleMenu(item.label)}
                  className={`nav-item ${isActive && !isExpanded ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="submenu">
                    {item.children.map(child => (
                      <Link 
                        key={child.href} 
                        href={child.href}
                        className={`sub-item ${pathname === child.href ? 'active' : ''}`}
                      >
                        <child.icon size={16} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="footer">
        <Link href="/dashboard/settings" className="nav-item">
          <Settings size={20} />
          Configurações
        </Link>
        <button className="nav-item logout-btn" onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}>
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
