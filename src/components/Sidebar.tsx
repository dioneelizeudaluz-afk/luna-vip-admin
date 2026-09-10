import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Users, ShoppingCart, Wallet, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/flow', label: 'Fluxo', icon: GitBranch },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/sales', label: 'Vendas', icon: ShoppingCart },
    { path: '/cashout', label: 'Cashout', icon: Wallet },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('luna_auth');
    navigate('/login');
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col" style={{ width: 240, background: '#0d0d0d', borderRight: '1px solid #1f1f1f', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50, padding: '20px 12px' }}>
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #1f1f1f', marginBottom: 20 }}>
          <h1 style={{ color: '#00ff88', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>LUNA VIP</h1>
          <p style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>PAINEL ADMIN</p>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="dh-nav-item" style={isActive ? { background: 'rgba(0,255,136,0.1)', color: '#00ff88' } : {}}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ paddingTop: 20, borderTop: '1px solid #1f1f1f' }}>
          <button onClick={handleLogout} className="dh-nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="lg:hidden" style={{ background: '#0d0d0d', borderBottom: '1px solid #1f1f1f', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h1 style={{ color: '#00ff88', fontWeight: 900, fontSize: 16 }}>LUNA VIP</h1>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>SAIR</button>
        </div>
        <nav style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap', textDecoration: 'none', borderRadius: 6, background: isActive ? 'rgba(0,255,136,0.15)' : '#111', color: isActive ? '#00ff88' : '#9ca3af' }}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}