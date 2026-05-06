'use client';

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
  BarChart3
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Vendas', href: '/dashboard/sales' },
  { icon: Package, label: 'Produtos', href: '/dashboard/products' },
  { icon: Users, label: 'Consignadores', href: '/dashboard/consignors' },
  { icon: Wallet, label: 'Financeiro', href: '/dashboard/finance' },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/reports' },
];

export default function Sidebar() {
  const pathname = usePathname();

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
          gap: 0.5rem;
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
          const isActive = pathname === item.href;
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
