import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    try {
      const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      setSales(data || []);
    } catch (e) {}
    setLoading(false);
  };

  const total = sales.length;
  const value = sales.filter(s => s.status === 'confirmada').reduce((a, s) => a + Number(s.amount), 0);
  const confirmed = sales.filter(s => s.status === 'confirmada').length;
  const pending = sales.filter(s => s.status === 'pendente').length;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Vendas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[{ l: 'Total', v: total }, { l: 'Valor', v: `${value.toFixed(2)} MT` }, { l: 'Confirmadas', v: confirmed }, { l: 'Pendentes', v: pending }].map((c, i) => (
          <div key={i} className="dh-card" style={{ padding: 16 }}>
            <p style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', marginBottom: 6 }}>{c.l}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#00ff88' }}>{c.v}</p>
          </div>
        ))}
      </div>

      <div className="dh-card" style={{ overflowX: 'auto' }}>
        {loading ? <p style={{ padding: 40, textAlign: 'center', color: '#666' }}>Carregando...</p> : sales.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#666' }}>Nenhuma venda</p>
        ) : (
          <table className="dh-table">
            <thead><tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Estado</th></tr></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td style={{ color: '#fff' }}>{s.customer_name}</td>
                  <td style={{ color: '#9ca3af' }}>{s.product}</td>
                  <td style={{ color: '#00ff88', fontWeight: 700 }}>{Number(s.amount).toFixed(2)} MT</td>
                  <td><span className={s.status === 'confirmada' ? 'dh-badge dh-badge-green' : 'dh-badge dh-badge-yellow'}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}