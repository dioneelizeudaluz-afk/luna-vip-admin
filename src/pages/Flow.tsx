import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, X, Move } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Plan { id: number; name: string; price: number; link: string; active: boolean; }
interface FlowNode { id: string; type: string; title: string; x: number; y: number; content?: string; image?: string; }

export default function Flow() {
  const [startMessage, setStartMessage] = useState('Bem-vindo à Luna VIP!\n\nEscolhe o teu plano abaixo:');
  const [startImage, setStartImage] = useState('');
  const [supportMessage, setSupportMessage] = useState('Entre em contacto com o suporte.');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => { loadFlow(); }, []);

  const loadFlow = async () => {
    const saved = localStorage.getItem('luna_flow');
    if (saved) {
      const d = JSON.parse(saved);
      setStartMessage(d.startMessage || startMessage);
      setStartImage(d.startImage || '');
      setSupportMessage(d.supportMessage || supportMessage);
      setPlans(d.plans || []);
      setNodes(d.nodes || defaultNodes(d.startMessage, d.startImage));
    } else {
      setNodes(defaultNodes(startMessage, ''));
    }
  };

  const defaultNodes = (msg: string, img: string): FlowNode[] => [
    { id: 'start', type: 'START', title: '/start', x: 40, y: 40 },
    { id: 'welcome', type: 'MENSAGEM', title: 'Boas-vindas', x: 40, y: 160, content: msg, image: img },
    { id: 'plans', type: 'BOTÕES', title: 'Ver Planos', x: 40, y: 300 },
    { id: 'payment', type: 'PAGAMENTO', title: 'Link EscalePay', x: 40, y: 420 },
    { id: 'delivery', type: 'ENTREGA', title: 'Grupo VIP', x: 40, y: 540 },
  ];

  const uploadImage = async (file: File) => {
    setUploading(true); setUploadError('');
    try {
      const ext = file.name.split('.').pop();
      const name = `start-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('bot-images').upload(name, file, { cacheControl: '3600' });
      if (error) { setUploadError('Erro: ' + error.message); return; }
      const { data: urlData } = supabase.storage.from('bot-images').getPublicUrl(data.path);
      setStartImage(urlData.publicUrl);
      setNodes(nodes.map(n => n.id === 'welcome' ? { ...n, image: urlData.publicUrl } : n));
    } catch (e: any) { setUploadError(e.message); }
    finally { setUploading(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) uploadImage(file);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging({ id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
    setSelectedNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const canvas = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvas.left - dragging.offsetX;
    const y = e.clientY - canvas.top - dragging.offsetY;
    setNodes(nodes.map(n => n.id === dragging.id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n));
  };

  const handleMouseUp = () => setDragging(null);

  const addNode = (type: string) => {
    const id = 'node_' + Date.now();
    setNodes([...nodes, { id, type, title: type, x: 300, y: nodes.length * 80 + 40 }]);
  };

  const deleteNode = (id: string) => {
    if (id === 'start') { alert('Não podes apagar o /start'); return; }
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNode(null);
  };

  const saveFlow = async () => {
    const data = { startMessage, startImage, supportMessage, plans, nodes };
    localStorage.setItem('luna_flow', JSON.stringify(data));
    try {
      await supabase.from('bot_settings').upsert({ id: 1, flow_data: JSON.stringify(data) });
    } catch (e) { console.error(e); }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderConnector = (from: FlowNode, to: FlowNode) => {
    const x1 = from.x + 90;
    const y1 = from.y + 80;
    const x2 = to.x + 90;
    const y2 = to.y;
    const midY = (y1 + y2) / 2;
    return (
      <svg key={`${from.id}-${to.id}`} className="flow-connector" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <path d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`} stroke="#00ff88" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx={x2} cy={y2} r="4" fill="#00ff88" opacity="0.8" />
      </svg>
    );
  };

  const connectors = [];
  for (let i = 0; i < nodes.length - 1; i++) connectors.push(renderConnector(nodes[i], nodes[i + 1]));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Fluxo do Bot</h1>
          <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Arrasta os blocos e edita o conteúdo</p>
        </div>
        <button onClick={saveFlow} className="dh-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={14} /> {saved ? 'GUARDADO!' : 'GUARDAR'}
        </button>
      </div>

      <div className="dh-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['MENSAGEM', 'IMAGEM', 'BOTÕES', 'PLANO', 'PAGAMENTO', 'ENTREGA'].map(t => (
            <button key={t} onClick={() => addNode(t)} style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', color: '#00ff88', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              + {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flow-canvas" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ minHeight: 650, position: 'relative' }}>
        {connectors}
        {nodes.map(node => (
          <div key={node.id} className={`flow-node ${node.type === 'START' ? 'flow-node-start' : ''} ${selectedNode === node.id ? 'selected' : ''}`} style={{ left: node.x, top: node.y, zIndex: 2 }} onMouseDown={(e) => handleMouseDown(e, node.id)}>
            <div className="flow-node-title">{node.type}</div>
            <div className="flow-node-content">{node.title}</div>
            {selectedNode === node.id && node.id !== 'start' && (
              <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} style={{ position: 'absolute', top: -8, right: -8, background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="dh-card" style={{ padding: 20, marginTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Mensagem de /start</h3>
        <textarea className="dh-input" rows={4} value={startMessage} onChange={(e) => { setStartMessage(e.target.value); setNodes(nodes.map(n => n.id === 'welcome' ? { ...n, content: e.target.value } : n)); }} style={{ marginBottom: 16, fontFamily: 'inherit' }} />

        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 8, fontWeight: 600 }}>IMAGEM (PNG/JPG)</label>
        {startImage ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img src={startImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #1f1f1f' }} />
              <button onClick={() => { setStartImage(''); setNodes(nodes.map(n => n.id === 'welcome' ? { ...n, image: '' } : n)); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="imageUpload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 30, background: '#0a0a0a', border: '2px dashed #1f1f1f', borderRadius: 12, cursor: 'pointer', marginBottom: 16 }}>
            {uploading ? (
              <p style={{ color: '#00ff88', fontSize: 13 }}>A enviar...</p>
            ) : (
              <>
                <Upload size={28} color="#00ff88" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: '#00ff88', fontWeight: 700 }}>Escolher imagem</p>
                <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>PNG, JPG • Máx 5MB</p>
              </>
            )}
            <input id="imageUpload" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
          </label>
        )}
        {uploadError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{uploadError}</p>}
      </div>

      <div className="dh-card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Planos VIP</h3>
          <button onClick={() => setPlans([...plans, { id: Date.now(), name: 'VIP Mensal', price: 30, link: 'https://checkout.escalepay.com/8170218', active: true }])} className="dh-btn" style={{ fontSize: 11, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={12} /> ADICIONAR
          </button>
        </div>

        {plans.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: 13, padding: 20 }}>Nenhum plano criado</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plans.map(p => (
              <div key={p.id} style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input className="dh-input" value={p.name} onChange={(e) => setPlans(plans.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))} placeholder="Nome do plano" style={{ flex: 2, minWidth: 120 }} />
                  <input className="dh-input" type="number" value={p.price} onChange={(e) => setPlans(plans.map(x => x.id === p.id ? { ...x, price: parseFloat(e.target.value) || 0 } : x))} placeholder="Preço R$" style={{ flex: 1, minWidth: 80 }} />
                  <button onClick={() => setPlans(plans.filter(x => x.id !== p.id))} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <input className="dh-input" value={p.link} onChange={(e) => setPlans(plans.map(x => x.id === p.id ? { ...x, link: e.target.value } : x))} placeholder="https://checkout.escalepay.com/xxxxx" style={{ marginBottom: 10, fontSize: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#00ff88', fontWeight: 700 }}>R$ {p.price.toFixed(2)}</span>
                  <button onClick={() => setPlans(plans.map(x => x.id === p.id ? { ...x, active: !x.active } : x))} style={{ background: p.active ? 'rgba(0,255,136,0.15)' : 'rgba(107,114,128,0.15)', color: p.active ? '#00ff88' : '#9ca3af', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    {p.active ? 'ATIVO' : 'INATIVO'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dh-card" style={{ padding: 20, marginTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Mensagem de Suporte</h3>
        <textarea className="dh-input" rows={3} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} style={{ fontFamily: 'inherit' }} />
      </div>
    </div>
  );
}