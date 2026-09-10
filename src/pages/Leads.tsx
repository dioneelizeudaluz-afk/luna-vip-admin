import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    try {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      setLeads(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = leads.filter(l => {
    const s = l.name?.toLowerCase().includes(search.toLowerCase()) || String(l.telegram_id).includes(search);
    const f = filter === 'todos' || l.status === filter;
    return s && f;
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Leads</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={16} color="#666" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="dh-input" placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="dh-input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
          <option value="todos">Todos</option>
          <option value="novo">Novo</option>
          <option value="interessado">Interessado</option>
          <option value="comprou">Comprou</option>
        </select>
      </div>

      <div className="dh-card" style={{ overflowX: 'auto' }}>
        {loading ? <p style={{ padding: 40, textAlign: 'center', color: '#666' }}>Carregando...</p> : filtered.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#666' }}>Nenhum lead</p>
        ) : (
          <table className="dh-table">
            <thead><tr><th>Telegram</th><th>Nome</th><th>Estado</th><th>Data</th></tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 12 }}>{l.telegram_id}</td>
                  <td style={{ color: '#fff' }}>{l.name}</td>
                  <td><span className="dh-badge dh-badge-green">{l.status}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}