import { useState, useEffect } from 'react';
import { Users, UserCheck, Users2, ShoppingCart, DollarSign, TrendingUp, Wallet, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    botUsers: 0, activeUsers: 0, leads: 0, sales: 0, messages: 0, conversion: '0%', balance: '0 MT', pendingCashout: '0 MT',
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMetrics(); }, []);

  const loadMetrics = async () => {
    try {
      const [bu, l, s, c] = await Promise.all([
        supabase.from('bot_users').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('cashouts').select('*').eq('status', 'pendente'),
      ]);
      const sales = s.data || [];
      const confirmed = sales.filter((x: any) => x.status === 'confirmada');
      const totalBalance = confirmed.reduce((a: number, x: any) => a + Number(x.amount), 0);
      const pendingCashout = (c.data || []).reduce((a: number, x: any) => a + Number(x.amount), 0);
      const conv = bu.data?.length ? ((confirmed.length / bu.data.length) * 100).toFixed(1) + '%' : '0%';

      setMetrics({
        botUsers: bu.data?.length || 0,
        activeUsers: bu.data?.length || 0,
        leads: l.data?.length || 0,
        sales: sales.length,
        messages: 0,
        conversion: conv,
        balance: totalBalance.toFixed(2) + ' MT',
        pendingCashout: pendingCashout.toFixed(2) + ' MT',
      });
      setRecent((bu.data || []).slice(-5).reverse());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const cards = [
    { label: 'Pessoas no Bot', value: metrics.botUsers, icon: Users },
    { label: 'Ativos', value: metrics.activeUsers, icon: UserCheck },
    { label: 'Leads', value: metrics.leads, icon: Users2 },
    { label: 'Vendas', value: metrics.sales, icon: ShoppingCart },
    { label: 'Mensagens', value: metrics.messages, icon: Users },
    { label: 'Conversão', value: metrics.conversion, icon: TrendingUp },
    { label: 'Saldo', value: metrics.balance, icon: DollarSign },
    { label: 'Cashout Pendente', value: metrics.pendingCashout, icon: Wallet },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="dh-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{c.label}</span>
                <Icon size={16} color="#00ff88" />
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#00ff88' }}>{loading ? '...' : c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="dh-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Atividade Recente</h3>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <Clock size={28} color="#333" />
            <p style={{ color: '#666', fontSize: 13, marginTop: 8 }}>Nenhuma atividade</p>
          </div>
        ) : (
          recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #1f1f1f' }}>
              <span style={{ color: '#fff', fontSize: 13 }}>{r.first_name || r.username || 'Utilizador'}</span>
              <span style={{ color: '#666', fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}