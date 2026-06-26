import { useState, useEffect, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://luqsaqktiglquspuxrxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cXNhcWt0aWdscXVzcHV4cnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTQ5MzYsImV4cCI6MjA5NzY5MDkzNn0.WxE4wVBKlLMNrcGd6989_Vi0TQmGgEc-Ayz9m4ytmIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0C0C0C; }
  body { font-family: 'Barlow', sans-serif; color: #fff; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  .fade-in { animation: fadeIn .25s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .slide-up { animation: slideUp .3s cubic-bezier(.16,1,.3,1); }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .btn-primary { background: #FBB724; color: #0C0C0C; font: 700 15px/1 'Barlow',sans-serif; letter-spacing:.02em; border: none; border-radius: 10px; padding: 14px 22px; cursor: pointer; transition: all .15s ease; width: 100%; }
  .btn-primary:hover { background: #F5A500; }
  .btn-primary:disabled { opacity: .35; cursor: not-allowed; }
  .btn-scan { background: #1a1a1a; color: #FBB724; font: 700 14px/1 'Barlow',sans-serif; border: 2px solid #FBB724; border-radius: 10px; padding: 14px 18px; cursor: pointer; transition: all .15s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-scan:hover { background: #FBB72422; }
  .btn-ghost { background: transparent; color: #888; font: 600 13px/1 'Barlow',sans-serif; border: 1px solid #252525; border-radius: 8px; padding: 10px 16px; cursor: pointer; transition: all .15s ease; }
  .btn-ghost:hover { border-color: #3a3a3a; color: #ccc; }
  .btn-danger { background: transparent; color: #F87171; font: 600 13px/1 'Barlow',sans-serif; border: 1px solid #3a2020; border-radius: 8px; padding: 8px 12px; cursor: pointer; transition: all .15s ease; flex-shrink: 0; }
  .btn-danger:hover { background: #3a2020; border-color: #F87171; }
  .card { background: #141414; border: 1px solid #202020; border-radius: 12px; }
  .scannable-item { background: #141414; border: 1.5px solid #1E1E1E; border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: all .12s ease; display: flex; align-items: center; gap: 12px; user-select: none; }
  .scannable-item:hover { border-color: #333; }
  .scannable-item.in-cart { border-color: #22C55E; background: rgba(34,197,94,.06); }
  .scannable-item.flash { animation: flashAnim .5s ease-out; }
  @keyframes flashAnim { 0% { background: rgba(251,183,36,.3); border-color: #FBB724; transform: scale(1.02); } 100% { background: #141414; transform: scale(1); } }
  .action-tile { background: #141414; border: 1.5px solid #1E1E1E; border-radius: 12px; padding: 18px; cursor: pointer; transition: all .18s ease; text-align: left; width: 100%; }
  .action-tile:hover { border-color: #FBB724; transform: translateY(-2px); }
  .code-input { width: 100%; background: #1a1a1a; border: 2px solid #FBB72444; border-radius: 12px; padding: 14px 16px; color: #FBB724; font: 700 16px/1 'DM Mono',monospace; outline: none; transition: all .15s; letter-spacing: .05em; text-transform: uppercase; }
  .code-input:focus { border-color: #FBB724; }
  .code-input::placeholder { color: #4a4a4a; }
  .search-input { width: 100%; background: #141414; border: 1px solid #202020; border-radius: 9px; padding: 10px 14px; color: #ddd; font: 400 14px/1 'Barlow',sans-serif; outline: none; }
  .admin-input { width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 11px 14px; color: #ddd; font: 400 14px/1 'Barlow',sans-serif; outline: none; transition: border-color .15s; }
  .admin-input:focus { border-color: #555; }
  .admin-input::placeholder { color: #aaa; }
  .scanner-overlay { position: fixed; inset: 0; background: #000; z-index: 1000; display: flex; flex-direction: column; }
  .scanner-overlay video { object-fit: cover !important; }
  @media print { body { background: white !important; } .no-print { display: none !important; } .print-page { background: white !important; color: black !important; } .qr-print-item { border: 1px solid #ddd !important; page-break-inside: avoid; } }
`;

const DEFAULT_USERS = [
  { id: 'u1', name: 'Anna Kowalska',    role: 'Fotograf modelkowy',  initials: 'AK', color: '#FBB724' },
  { id: 'u2', name: 'Marek Nowak',      role: 'Fotograf produktowy', initials: 'MN', color: '#34D399' },
  { id: 'u3', name: 'Zofia Wiśniewska', role: 'Zespół produkcyjny',  initials: 'ZW', color: '#818CF8' },
  { id: 'u4', name: 'Piotr Zając',      role: 'Zespół zewnętrzny',   initials: 'PZ', color: '#FB7185' },
];

const CATEGORIES = {
  STAT: { name: 'Statywy',      icon: '📐' },
  LAMP: { name: 'Lampy',        icon: '💡' },
  GENE: { name: 'Generatory',   icon: '⚡' },
  SOFT: { name: 'Modyfikatory', icon: '🔲' },
  TRIG: { name: 'Wyzwalacze',   icon: '📡' },
  BATT: { name: 'Baterie',      icon: '🔋' },
  BGND: { name: 'Tła',          icon: '🖼️' },
  APPA: { name: 'Aparaty',      icon: '📷' },
  INNE: { name: 'Inne',         icon: '📦' },
};

const PRESET_COLORS = ['#FBB724','#34D399','#818CF8','#FB7185','#38BDF8','#F97316','#A78BFA','#4ADE80'];
const DEFAULT_ADMIN_PASSWORD = 'admin1';

function now() {
  const d = new Date();
  return `${d.toLocaleDateString('pl-PL')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

const getLocationLabel = (loc, users) => {
  if (loc === 'warehouse') return 'Magazyn';
  const user = (users || DEFAULT_USERS).find(u => u.id === loc);
  return user ? user.name : loc;
};

function Avatar({ user, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size/2, background: user.color+'1A', border: `1.5px solid ${user.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color: user.color, fontFamily:'DM Mono,monospace', fontWeight:500, fontSize: size*.34, flexShrink:0 }}>{user.initials}</div>
  );
}

function QRScannerModal({ onScan, onClose, scannedCount }) {
  const [recentCodes, setRecentCodes] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);
  const handleDetected = (results) => {
    if (!results || results.length === 0) return;
    const code = results[0].rawValue?.toUpperCase().trim();
    if (!code) return;
    if (recentCodes.includes(code)) return;
    setRecentCodes(prev => [...prev, code]);
    setTimeout(() => setRecentCodes(prev => prev.filter(c => c !== code)), 2000);
    if (navigator.vibrate) navigator.vibrate(80);
    const result = onScan(code);
    setLastFeedback({ code, ok: result.ok, msg: result.msg });
    setTimeout(() => setLastFeedback(null), 2500);
  };
  return (
    <div className="scanner-overlay">
      <div style={{ padding:'16px 20px', background:'#0C0C0C', borderBottom:'1px solid #222', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>📷 Skanuj kod</div>
          <div style={{ color:'#888', fontSize:13, marginTop:2 }}>Zeskanowane: {scannedCount}</div>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width:'auto', padding:'10px 20px', fontSize:14 }}>✓ Gotowe</button>
      </div>
      <div style={{ flex:1, position:'relative', background:'#000', overflow:'hidden' }}>
        <Scanner onScan={handleDetected} onError={(err) => console.error(err)}
          constraints={{ facingMode:'environment', width:{ ideal:1280 }, height:{ ideal:720 } }}
          scanDelay={80}
          formats={['code_128','code_39','ean_13','ean_8','upc_a','upc_e','codabar','itf','qr_code','data_matrix']}
          styles={{ container:{ width:'100%', height:'100%' }, video:{ width:'100%', height:'100%', objectFit:'cover' } }}
        />
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'85%', maxWidth:340, height:120, border:'3px solid #FBB724', borderRadius:12, boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)', position:'relative' }}>
            {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
              <div key={i} style={{ position:'absolute', width:20, height:20, borderColor:'#FBB724', borderStyle:'solid', borderWidth:0, ...(pos.top===0?{borderTopWidth:4}:{borderBottomWidth:4}), ...(pos.left===0?{borderLeftWidth:4}:{borderRightWidth:4}), ...pos }} />
            ))}
          </div>
        </div>
        {lastFeedback && (
          <div className="slide-up" style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', background: lastFeedback.ok?'rgba(34,197,94,0.95)':'rgba(248,113,113,0.95)', color:'#fff', padding:'12px 20px', borderRadius:10, fontWeight:600, fontSize:14, maxWidth:'85%', textAlign:'center' }}>
            {lastFeedback.ok?'✓ ':'⚠️ '}<strong>{lastFeedback.code}</strong>
            {lastFeedback.msg && <div style={{ fontSize:12, marginTop:4, opacity:.9 }}>{lastFeedback.msg}</div>}
          </div>
        )}
      </div>
      <div style={{ padding:'14px 20px', background:'#0C0C0C', borderTop:'1px solid #222', textAlign:'center', color:'#888', fontSize:13 }}>
        Skieruj aparat na kod QR lub kod kreskowy
      </div>
    </div>
  );
}

function AdminLoginView({ adminPassword, onLogin, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = () => { if (password === adminPassword) { onLogin(); } else { setError('Nieprawidłowe hasło'); setPassword(''); } };
  return (
    <div className="fade-in" style={{ padding:'0 20px 40px', maxWidth:400, margin:'0 auto' }}>
      <div style={{ textAlign:'center', padding:'50px 0 32px' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔐</div>
        <div style={{ color:'#fff', fontWeight:800, fontSize:22 }}>Panel Admina</div>
        <div style={{ color:'#888', fontSize:13, marginTop:6 }}>Wprowadź hasło dostępu</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <input className="admin-input" type="password" placeholder="Hasło" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key==='Enter'&&handleSubmit()} style={{ fontSize:16, padding:'14px 16px' }} />
        {error && <div style={{ color:'#F87171', fontSize:13 }}>⚠️ {error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={!password}>Zaloguj →</button>
        <button className="btn-ghost" onClick={onBack} style={{ textAlign:'center' }}>← Powrót</button>
      </div>
      <div style={{ marginTop:24, padding:14, background:'#141414', borderRadius:10, border:'1px solid #202020', color:'#666', fontSize:12, textAlign:'center' }}>
        Domyślne hasło: <span style={{ fontFamily:'DM Mono,monospace', color:'#aaa' }}>admin1</span>
      </div>
    </div>
  );
}

function ImportPanel({ equipment, onSaveEquipment, onClose }) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState([]);
  const [done, setDone] = useState(false);
  const parseText = (text) => {
    if (!text.trim()) { setParsed([]); return; }
    const lines = text.trim().split('\n').filter(l => l.trim());
    const items = lines.map(line => {
      const sep = line.includes('\t') ? '\t' : ',';
      const parts = line.split(sep).map(p => p.trim().replace(/^"|"$/g,''));
      const code = (parts[0]||'').toUpperCase().trim();
      const name = (parts[1]||'').trim();
      const rawCat = (parts[2]||'').toUpperCase().trim();
      const cat = Object.keys(CATEGORIES).includes(rawCat) ? rawCat : 'INNE';
      const isDup = !!equipment.find(e => e.code === code);
      const valid = !!(code && name);
      return { code, name, cat, isDup, valid };
    });
    setParsed(items);
  };
  const toImport = parsed.filter(i => i.valid && !i.isDup);
  const dupCount = parsed.filter(i => i.isDup).length;
  const handleImport = () => {
    const newItems = toImport.map(item => ({ id:'e'+Date.now()+'_'+Math.random().toString(36).slice(2), code:item.code, name:item.name, cat:item.cat, location:'warehouse', assigned_to:null }));
    onSaveEquipment([...equipment, ...newItems]);
    setDone(true);
  };
  if (done) return (
    <div className="card slide-up" style={{ padding:20, marginBottom:14, textAlign:'center' }}>
      <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
      <div style={{ color:'#22C55E', fontWeight:700, fontSize:16, marginBottom:4 }}>Zaimportowano {toImport.length} elementów!</div>
      <div style={{ color:'#888', fontSize:13, marginBottom:16 }}>Wszystkie trafiły do magazynu.</div>
      <button className="btn-primary" onClick={onClose}>Gotowe</button>
    </div>
  );
  return (
    <div className="card slide-up" style={{ padding:16, marginBottom:14 }}>
      <div style={{ color:'#888', fontSize:11, marginBottom:10, textTransform:'uppercase', letterSpacing:'.08em' }}>📥 Import z Excela</div>
      <div style={{ background:'#1a1a1a', borderRadius:8, padding:12, marginBottom:12, border:'1px solid #2a2a2a', fontSize:13, color:'#aaa', lineHeight:1.6 }}>
        <strong style={{ color:'#FBB724' }}>Jak to zrobić:</strong><br/>
        1. Otwórz Excel z bazą sprzętu<br/>
        2. Zaznacz kolumny <strong style={{ color:'#fff' }}>KOD</strong>, <strong style={{ color:'#fff' }}>NAZWA</strong>, <strong style={{ color:'#fff' }}>KATEGORIA</strong><br/>
        3. Cmd+C → kliknij poniżej → Cmd+V
      </div>
      <textarea value={raw} onChange={e => { setRaw(e.target.value); parseText(e.target.value); }}
        placeholder={"16000005134\tGenerator Broncolor Scoro\tGENE\n..."}
        style={{ width:'100%', minHeight:130, background:'#111', border:'2px solid #FBB72444', borderRadius:10, padding:12, color:'#FBB724', fontFamily:'DM Mono,monospace', fontSize:12, outline:'none', resize:'vertical', lineHeight:1.5 }} />
      {parsed.length > 0 && (
        <div className="slide-up" style={{ marginTop:12 }}>
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
            <div style={{ background:'#1a2a1a', border:'1px solid #22C55E33', borderRadius:8, padding:'6px 12px', color:'#22C55E', fontSize:13, fontWeight:600 }}>✓ {toImport.length} do importu</div>
            {dupCount > 0 && <div style={{ background:'#2a2010', border:'1px solid #FBB72433', borderRadius:8, padding:'6px 12px', color:'#FBB724', fontSize:13 }}>⚠ {dupCount} duplikatów</div>}
          </div>
          <div style={{ background:'#111', borderRadius:8, padding:'6px 10px', marginBottom:12, maxHeight:200, overflowY:'auto' }}>
            {parsed.slice(0,30).map((item,i) => (
              <div key={i} style={{ display:'flex', gap:8, fontSize:12, padding:'4px 0', borderBottom:'1px solid #1a1a1a', color: !item.valid?'#F87171':item.isDup?'#FBB724':'#aaa' }}>
                <span style={{ fontFamily:'DM Mono,monospace', flexShrink:0, minWidth:100 }}>{item.code||'—'}</span>
                <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name||'—'}</span>
                <span style={{ color:'#555', flexShrink:0 }}>{item.cat}</span>
                {item.isDup && <span style={{ color:'#FBB724', flexShrink:0 }}>duplikat</span>}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-primary" onClick={handleImport} disabled={toImport.length===0}>✓ Importuj {toImport.length} →</button>
            <button className="btn-ghost" onClick={onClose} style={{ flexShrink:0 }}>Anuluj</button>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ users, onSaveUsers }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const initials = name.trim().split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'??';
  const handleAdd = () => {
    if (!name.trim()) return;
    onSaveUsers([...users, { id:'u'+Date.now(), name:name.trim(), role:role.trim()||'Fotograf', initials, color:selectedColor }]);
    setName(''); setRole(''); setSelectedColor(PRESET_COLORS[0]); setShowForm(false);
  };
  const handleDelete = (userId) => { if (!window.confirm('Usunąć tego użytkownika?')) return; onSaveUsers(users.filter(u=>u.id!==userId)); };
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ color:'#888', fontSize:13 }}>{users.length} użytkowników</div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ width:'auto', padding:'8px 16px', fontSize:13 }}>{showForm?'✕ Anuluj':'+ Dodaj użytkownika'}</button>
      </div>
      {showForm && (
        <div className="card slide-up" style={{ padding:16, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, padding:'10px 12px', background:'#1a1a1a', borderRadius:8 }}>
            <div style={{ width:40, height:40, borderRadius:20, background:selectedColor+'1A', border:`1.5px solid ${selectedColor}44`, display:'flex', alignItems:'center', justifyContent:'center', color:selectedColor, fontFamily:'DM Mono,monospace', fontWeight:500, fontSize:14 }}>{initials}</div>
            <div><div style={{ color:'#eee', fontWeight:600, fontSize:14 }}>{name||'Imię i nazwisko'}</div><div style={{ color:'#666', fontSize:12 }}>{role||'Rola'}</div></div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <input className="admin-input" placeholder="Imię i nazwisko *" value={name} onChange={e=>setName(e.target.value)} />
            <input className="admin-input" placeholder="Rola (np. Fotograf modelkowy)" value={role} onChange={e=>setRole(e.target.value)} />
            <div>
              <div style={{ color:'#666', fontSize:12, marginBottom:8 }}>Kolor awatara</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {PRESET_COLORS.map(c => <div key={c} onClick={()=>setSelectedColor(c)} style={{ width:32, height:32, borderRadius:16, background:c, cursor:'pointer', border:selectedColor===c?'3px solid #fff':'3px solid transparent', transition:'border-color .15s' }} />)}
              </div>
            </div>
            <button className="btn-primary" onClick={handleAdd} disabled={!name.trim()} style={{ marginTop:4 }}>Dodaj użytkownika</button>
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {users.map(u => (
          <div key={u.id} className="card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
            <Avatar user={u} size={40} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'#eee', fontWeight:600, fontSize:14 }}>{u.name}</div>
              <div style={{ color:'#888', fontSize:12, marginTop:2 }}>{u.role}</div>
            </div>
            <button className="btn-danger" onClick={()=>handleDelete(u.id)}>Usuń</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentTab({ equipment, users, onSaveEquipment, onAssign }) {
  const [mode, setMode] = useState('list');
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [cat, setCat] = useState('LAMP');

  const handleAdd = () => {
    const trimCode = code.trim().toUpperCase();
    if (!trimCode || !name.trim()) return;
    if (equipment.find(e => e.code === trimCode)) { alert(`Kod ${trimCode} już istnieje!`); return; }
    onSaveEquipment([...equipment, { id:'e'+Date.now(), code:trimCode, name:name.trim(), cat, location:'warehouse', assigned_to:null }]);
    setCode(''); setName(''); setCat('LAMP'); setMode('list');
  };

  const handleDelete = (itemId) => {
    if (!window.confirm('Usunąć ten element sprzętu?')) return;
    onSaveEquipment(equipment.filter(e => e.id !== itemId));
  };

  const filtered = equipment.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <div style={{ color:'#888', fontSize:13 }}>{equipment.length} elementów</div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>setMode(mode==='import'?'list':'import')} style={{ background:mode==='import'?'#1a1a1a':'#1a2a1a', color:mode==='import'?'#888':'#22C55E', border:`1px solid ${mode==='import'?'#333':'#22C55E44'}`, borderRadius:8, padding:'8px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Barlow,sans-serif' }}>
            {mode==='import'?'✕ Anuluj':'📥 Import z Excela'}
          </button>
          <button className="btn-primary" onClick={()=>setMode(mode==='add'?'list':'add')} style={{ width:'auto', padding:'8px 12px', fontSize:12 }}>{mode==='add'?'✕ Anuluj':'+ Dodaj'}</button>
        </div>
      </div>

      {mode==='import' && <ImportPanel equipment={equipment} onSaveEquipment={onSaveEquipment} onClose={()=>setMode('list')} />}

      {mode==='add' && (
        <div className="card slide-up" style={{ padding:16, marginBottom:14 }}>
          <div style={{ color:'#888', fontSize:11, marginBottom:12, textTransform:'uppercase', letterSpacing:'.08em' }}>Nowy element sprzętu</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <input className="admin-input" placeholder="Kod z naklejki *" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} style={{ fontFamily:'DM Mono,monospace', letterSpacing:'.05em' }} />
            <input className="admin-input" placeholder="Nazwa sprzętu *" value={name} onChange={e=>setName(e.target.value)} />
            <select value={cat} onChange={e=>setCat(e.target.value)} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, padding:'11px 14px', color:'#ddd', fontSize:14, outline:'none' }}>
              {Object.entries(CATEGORIES).map(([key,val]) => <option key={key} value={key}>{val.icon} {val.name}</option>)}
            </select>
            <button className="btn-primary" onClick={handleAdd} disabled={!code.trim()||!name.trim()} style={{ marginTop:4 }}>Dodaj do magazynu</button>
          </div>
        </div>
      )}

      <input className="search-input" placeholder="🔍 Szukaj po nazwie lub kodzie..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:12 }} />

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.length===0 && <div style={{ color:'#555', textAlign:'center', padding:40, fontSize:14 }}>{search?'Brak wyników':'Brak sprzętu'}</div>}
        {filtered.map(item => {
          const assignedUser = item.assigned_to ? users.find(u=>u.id===item.assigned_to) : null;
          return (
            <div key={item.id} className="card" style={{ padding:'10px 13px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#ccc', fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#666', marginTop:2 }}>{item.code}</div>
                </div>
                <button className="btn-danger" onClick={()=>handleDelete(item.id)} style={{ padding:'6px 10px', fontSize:12 }}>Usuń</button>
              </div>
              {/* Przypisanie */}
              <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid #1a1a1a', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'#666', fontSize:12 }}>📌 Przypisany do:</span>
                <select value={item.assigned_to||''} onChange={e=>onAssign(item.id, e.target.value||null)}
                  style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6, padding:'4px 8px', color:assignedUser?assignedUser.color:'#888', fontSize:12, outline:'none', flex:1 }}>
                  <option value="">— Brak przypisania —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusTab({ users, equipment }) {
  const warehouseItems = equipment.filter(e => e.location==='warehouse' && !e.assigned_to);
  const assignedItems = equipment.filter(e => e.assigned_to);
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:18 }}>
        <div className="card" style={{ padding:14, textAlign:'center' }}>
          <div style={{ color:'#22C55E', fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace' }}>{warehouseItems.length}</div>
          <div style={{ color:'#888', fontSize:12, marginTop:4 }}>W magazynie</div>
        </div>
        <div className="card" style={{ padding:14, textAlign:'center' }}>
          <div style={{ color:'#FBB724', fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace' }}>{equipment.length-warehouseItems.length}</div>
          <div style={{ color:'#888', fontSize:12, marginTop:4 }}>U fotografów</div>
        </div>
      </div>

      {users.map(user => {
        const userItems = equipment.filter(e => e.location===user.id && !e.assigned_to);
        const userAssigned = equipment.filter(e => e.assigned_to===user.id);
        return (
          <div key={user.id} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <Avatar user={user} size={32} />
              <div style={{ flex:1 }}>
                <div style={{ color:'#eee', fontWeight:600, fontSize:14 }}>{user.name}</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {userAssigned.length>0 && <div style={{ background:'#1a1a2a', border:'1px solid #818CF844', borderRadius:6, padding:'3px 8px', color:'#818CF8', fontSize:11 }}>📌 {userAssigned.length}</div>}
                {userItems.length>0 && <div style={{ background:'#FBB72422', border:'1px solid #FBB72444', borderRadius:6, padding:'3px 8px', color:'#FBB724', fontSize:11 }}>📤 {userItems.length}</div>}
              </div>
            </div>
            {userAssigned.length>0 && (
              <div style={{ paddingLeft:42, marginBottom:6 }}>
                <div style={{ color:'#818CF8', fontSize:11, marginBottom:4 }}>📌 Sprzęt przypisany na stałe</div>
                {userAssigned.map(item => (
                  <div key={item.id} className="card" style={{ padding:'7px 11px', display:'flex', alignItems:'center', gap:8, marginBottom:3, borderColor:'#818CF822' }}>
                    <span style={{ fontSize:15 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'#bbb', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                    </div>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#666' }}>{item.code}</span>
                  </div>
                ))}
              </div>
            )}
            {userItems.length>0 && (
              <div style={{ paddingLeft:42 }}>
                <div style={{ color:'#FBB724', fontSize:11, marginBottom:4 }}>📤 Wypożyczony sprzęt</div>
                {userItems.map(item => (
                  <div key={item.id} className="card" style={{ padding:'7px 11px', display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:15 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'#ccc', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                    </div>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#666' }}>{item.code}</span>
                  </div>
                ))}
              </div>
            )}
            {userAssigned.length===0 && userItems.length===0 && (
              <div style={{ paddingLeft:42, color:'#444', fontSize:12 }}>Brak sprzętu</div>
            )}
          </div>
        );
      })}

      {warehouseItems.length>0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>📦 W magazynie ({warehouseItems.length})</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {warehouseItems.map(item => (
              <div key={item.id} className="card" style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#ccc', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                </div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#666' }}>{item.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminView({ users, equipment, onSaveUsers, onSaveEquipment, onAssign, onBack }) {
  const [tab, setTab] = useState('status');
  return (
    <div className="fade-in" style={{ padding:'16px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Panel Admina</div>
          <div style={{ color:'#888', fontSize:12, marginTop:1 }}>Zarządzaj sprzętem i użytkownikami</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:3, marginBottom:20, background:'#141414', borderRadius:10, padding:4, border:'1px solid #202020' }}>
        {[{key:'status',label:'📊 Stan'},{key:'users',label:'👤 Użytkownicy'},{key:'equipment',label:'📦 Sprzęt'}].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ flex:1, padding:'9px 4px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'Barlow,sans-serif', fontWeight:600, fontSize:12, background:tab===t.key?'#FBB724':'transparent', color:tab===t.key?'#0C0C0C':'#888', transition:'all .15s' }}>{t.label}</button>
        ))}
      </div>
      {tab==='status' && <StatusTab users={users} equipment={equipment} />}
      {tab==='users' && <UsersTab users={users} onSaveUsers={onSaveUsers} />}
      {tab==='equipment' && <EquipmentTab equipment={equipment} users={users} onSaveEquipment={onSaveEquipment} onAssign={onAssign} />}
    </div>
  );
}

function LoginView({ users, onLogin, onReset, onPrintCodes, onAdmin }) {
  return (
    <div className="fade-in" style={{ padding:'0 20px 40px', maxWidth:440, margin:'0 auto' }}>
      <div style={{ textAlign:'center', padding:'40px 0 28px' }}>
        <div style={{ fontSize:42, marginBottom:10 }}>📷</div>
        <div style={{ color:'#fff', fontWeight:800, fontSize:26 }}>Studio Inventory</div>
        <div style={{ color:'#888', fontSize:13, marginTop:6 }}>Wybierz kto to Ty</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
        {users.length===0 && <div style={{ color:'#666', textAlign:'center', padding:30, fontSize:14 }}>Brak użytkowników — dodaj przez Panel Admina</div>}
        {users.map(u => (
          <div key={u.id} className="card" onClick={()=>onLogin(u)} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
            <Avatar user={u} size={44} />
            <div style={{ flex:1 }}>
              <div style={{ color:'#eee', fontWeight:600, fontSize:15 }}>{u.name}</div>
              <div style={{ color:'#888', fontSize:13, marginTop:2 }}>{u.role}</div>
            </div>
            <div style={{ color:'#555' }}>→</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        <button className="btn-ghost" onClick={onAdmin} style={{ fontSize:11 }}>🔐 Admin</button>
        <button className="btn-ghost" onClick={onPrintCodes} style={{ fontSize:11 }}>🖨️ Drukuj kody QR</button>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize:11 }}>🔄 Resetuj dane</button>
      </div>
    </div>
  );
}

function HomeView({ user, equipment, history, onAction, onLogout, onAssign }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const assignedItems = equipment.filter(e => e.assigned_to===user.id);
  const myItems = equipment.filter(e => e.location===user.id && !e.assigned_to);
  const warehouseCount = equipment.filter(e => e.location==='warehouse').length;
  const myHistory = history.filter(h => h.userId===user.id).length;

  return (
    <div className="fade-in" style={{ padding:'20px 20px 40px', maxWidth:480, margin:'0 auto' }}>

      {selectedItem && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={()=>setSelectedItem(null)}>
          <div className="slide-up" onClick={e=>e.stopPropagation()} style={{ background:'#1a1a1a', borderRadius:'16px 16px 0 0', padding:24, width:'100%', maxWidth:480, paddingBottom:40 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <span style={{ fontSize:28 }}>{CATEGORIES[selectedItem.cat]?.icon||'📦'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'#fff', fontWeight:700, fontSize:15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{selectedItem.name}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'#666', marginTop:2 }}>{selectedItem.code}</div>
              </div>
            </div>
            {selectedItem.assigned_to === user.id ? (
              <>
                <div style={{ color:'#818CF8', fontSize:13, marginBottom:16, padding:'10px 14px', background:'#818CF811', borderRadius:8, border:'1px solid #818CF822' }}>
                  📌 Ten sprzęt jest przypisany do Ciebie na stałe.
                </div>
                <button className="btn-primary" onClick={()=>{ onAssign(selectedItem.id, null); setSelectedItem(null); }} style={{ background:'#F87171', marginBottom:10 }}>
                  📤 Zdaj sprzęt i usuń przypisanie
                </button>
              </>
            ) : (
              <>
                <div style={{ color:'#888', fontSize:13, marginBottom:16, lineHeight:1.5 }}>
                  Przypisz ten sprzęt do swojego konta — będzie Twój na stałe i nie pojawi się w puli do wypożyczenia.
                </div>
                <button className="btn-primary" onClick={()=>{ onAssign(selectedItem.id, user.id); setSelectedItem(null); }} style={{ marginBottom:10 }}>
                  📌 Przypisz do siebie na stałe
                </button>
              </>
            )}
            <button className="btn-ghost" onClick={()=>setSelectedItem(null)} style={{ width:'100%', textAlign:'center' }}>Anuluj</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Avatar user={user} size={46} />
        <div style={{ flex:1 }}>
          <div style={{ color:'#888', fontSize:13 }}>Zalogowany jako</div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>{user.name}</div>
        </div>
        <button className="btn-ghost" onClick={onLogout} style={{ padding:'6px 10px', fontSize:11 }}>Wyloguj</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24 }}>
        {[{val:myItems.length+assignedItems.length, color:'#FBB724', label:'U Ciebie'},{val:warehouseCount, color:'#22C55E', label:'Magazyn'},{val:myHistory, color:'#818CF8', label:'Twoje akcje'}].map(({val,color,label}) => (
          <div key={label} className="card" style={{ padding:14, textAlign:'center' }}>
            <div style={{ color, fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace', lineHeight:1 }}>{val}</div>
            <div style={{ color:'#888', fontSize:12, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {assignedItems.length>0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ color:'#818CF8', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>
            📌 Sprzęt przypisany ({assignedItems.length}) <span style={{ color:'#555', fontWeight:400, fontSize:10, textTransform:'none' }}>— dotknij by zarządzać</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {assignedItems.map(item => (
              <div key={item.id} onClick={()=>setSelectedItem(item)} style={{ background:'#141414', border:'1.5px solid #818CF833', borderRadius:10, padding:'10px 13px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <span style={{ fontSize:18 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#ccc', fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                </div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#818CF8' }}>{item.code}</span>
                <span style={{ color:'#555', fontSize:18 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myItems.length>0 && (
        <div style={{ marginBottom:22 }}>
          <div style={{ color:'#888', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>
            Sprzęt u Ciebie ({myItems.length}) <span style={{ color:'#555', fontWeight:400, fontSize:10, textTransform:'none' }}>— dotknij by przypisać</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {myItems.map(item => (
              <div key={item.id} onClick={()=>setSelectedItem(item)} style={{ background:'#141414', border:'1.5px solid #1E1E1E', borderRadius:10, padding:'10px 13px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <span style={{ fontSize:18 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#ccc', fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                </div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#888' }}>{item.code}</span>
                <span style={{ color:'#555', fontSize:18 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ color:'#888', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Akcje</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          {action:'checkout', icon:'📤', label:'Pobierz sprzęt', sub:'Z magazynu — zeskanuj QR lub wpisz kod'},
          ...(myItems.length>0?[{action:'return', icon:'📥', label:'Zwróć do magazynu', sub:'Twój sprzęt wraca do magazynu'}]:[]),
          {action:'catalog', icon:'🔍', label:'Katalog sprzętu', sub:'Zobacz gdzie jest jaki sprzęt'},
          {action:'history', icon:'📋', label:'Historia operacji', sub:`${history.length} ${history.length===1?'operacja':'operacji'}`},
        ].map(({action,icon,label,sub}) => (
          <button key={action} className="action-tile" onClick={()=>onAction(action)}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <div>
                <div style={{ color:'#eee', fontWeight:700, fontSize:15 }}>{label}</div>
                <div style={{ color:'#888', fontSize:13, marginTop:2 }}>{sub}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScanView({ user, equipment, users, mode, onConfirm, onBack }) {
  const [codeInput, setCodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [flashId, setFlashId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const mc = mode==='checkout'
    ? {title:'Pobierz sprzęt', verb:'Pobierz', color:'#FBB724', icon:'📤', source:'magazyn'}
    : {title:'Zwróć sprzęt', verb:'Zwróć', color:'#34D399', icon:'📥', source:'sprzęt u Ciebie'};
  // Exclude assigned equipment from checkout
  const availableItems = mode==='checkout'
    ? equipment.filter(e => e.location==='warehouse' && !e.assigned_to)
    : equipment.filter(e => e.location===user.id && !e.assigned_to);
  const tryAddCode = (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return {ok:false, msg:'Pusty kod'};
    const item = availableItems.find(e => e.code===code);
    if (!item) {
      const exists = equipment.find(e => e.code===code);
      if (exists) {
        if (exists.assigned_to) return {ok:false, msg:`Sprzęt przypisany na stałe do ${getLocationLabel(exists.assigned_to, users)}`};
        const msg = mode==='checkout' ? `Nie w magazynie (u: ${getLocationLabel(exists.location, users)})` : `Nie u Ciebie (u: ${getLocationLabel(exists.location, users)})`;
        return {ok:false, msg};
      }
      return {ok:false, msg:'Nieznany kod'};
    }
    if (cart.find(c => c.id===item.id)) return {ok:false, msg:'Już dodany'};
    setCart(prev => [...prev, item]);
    setFlashId(item.id);
    setTimeout(()=>setFlashId(null), 500);
    return {ok:true, msg:item.name};
  };
  const handleAddByCode = () => {
    const result = tryAddCode(codeInput);
    if (!result.ok) { setErrorMsg(result.msg); setTimeout(()=>setErrorMsg(''),3000); }
    else setCodeInput('');
  };
  const handleItemClick = (item) => {
    if (cart.find(c=>c.id===item.id)) setCart(cart.filter(c=>c.id!==item.id));
    else { setCart([...cart, item]); setFlashId(item.id); setTimeout(()=>setFlashId(null),400); }
  };
  const handleConfirm = () => { onConfirm({mode, cart}); setConfirmed(true); };
  if (confirmed) return (
    <div className="fade-in" style={{ padding:24, maxWidth:480, margin:'0 auto', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
      <div style={{ width:72, height:72, borderRadius:36, background:'#1a2a1a', border:'2px solid #22C55E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34 }}>✅</div>
      <div style={{ color:'#fff', fontWeight:800, fontSize:22 }}>Gotowe!</div>
      <div style={{ color:'#888', fontSize:14, textAlign:'center' }}>{mode==='checkout'?'Pobrano':'Zwrócono'} {cart.length} {cart.length===1?'element':cart.length<5?'elementy':'elementów'}</div>
      <button className="btn-primary" onClick={onBack} style={{ marginTop:8 }}>← Powrót do menu</button>
    </div>
  );
  return (
    <>
      {scannerOpen && <QRScannerModal onScan={tryAddCode} onClose={()=>setScannerOpen(false)} scannedCount={cart.length} />}
      <div style={{ padding:'16px 20px 200px', maxWidth:480, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>{mc.title}</div>
            <div style={{ color:'#888', fontSize:13, marginTop:1 }}>Źródło: {mc.source}</div>
          </div>
          {cart.length>0 && <div style={{ background:mc.color+'22', color:mc.color, fontFamily:'DM Mono,monospace', fontWeight:700, fontSize:15, width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>{cart.length}</div>}
        </div>
        <button className="btn-scan" onClick={()=>setScannerOpen(true)} style={{ width:'100%', padding:'18px', marginBottom:12, fontSize:16 }}>📷 Skanuj kod QR aparatem</button>
        <div className="card" style={{ padding:12, marginBottom:14 }}>
          <div style={{ color:'#888', fontSize:12, marginBottom:8, letterSpacing:'.05em', textTransform:'uppercase' }}>Lub wpisz kod ręcznie</div>
          <div style={{ display:'flex', gap:8 }}>
            <input type="text" className="code-input" placeholder="STAT-001" value={codeInput} onChange={e=>{setCodeInput(e.target.value);setErrorMsg('');}} onKeyDown={e=>e.key==='Enter'&&handleAddByCode()} />
            <button className="btn-primary" onClick={handleAddByCode} disabled={!codeInput.trim()} style={{ width:'auto', padding:'0 20px', flexShrink:0, fontSize:13 }}>Dodaj</button>
          </div>
          {errorMsg && <div className="slide-up" style={{ color:'#F87171', fontSize:13, marginTop:8 }}>⚠️ {errorMsg}</div>}
        </div>
        <div style={{ color:'#888', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Lub wybierz z listy ({availableItems.length})</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {availableItems.length===0 && <div style={{ color:'#555', textAlign:'center', padding:40, fontSize:14 }}>{mode==='checkout'?'Magazyn jest pusty':'Nie masz żadnego sprzętu'}</div>}
          {availableItems.map(item => {
            const inCart = !!cart.find(c=>c.id===item.id);
            const flashing = flashId===item.id;
            return (
              <div key={item.id} className={`scannable-item${inCart?' in-cart':''}${flashing?' flash':''}`} onClick={()=>handleItemClick(item)}>
                <span style={{ fontSize:22 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:inCart?'#86EFAC':'#ccc', fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#888', marginTop:3 }}>{item.code}</div>
                </div>
                <div style={{ width:24, height:24, borderRadius:12, border:`2px solid ${inCart?'#22C55E':'#252525'}`, background:inCart?'#22C55E':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#0A0A0A', fontWeight:800, flexShrink:0 }}>{inCart&&'✓'}</div>
              </div>
            );
          })}
        </div>
        {cart.length>0 && (
          <div className="slide-up" style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, padding:'12px 20px 20px', background:'linear-gradient(to top, #0C0C0C 80%, transparent)' }}>
            <div className="card" style={{ padding:'10px 13px', marginBottom:8 }}>
              <div style={{ color:'#eee', fontSize:13, fontWeight:600 }}>Wybrano: {cart.length} {cart.length===1?'element':cart.length<5?'elementy':'elementów'}</div>
              <div style={{ color:'#888', fontSize:11, fontFamily:'DM Mono,monospace', marginTop:3 }}>{cart.map(i=>i.code).join(' · ')}</div>
            </div>
            <button className="btn-primary" onClick={handleConfirm} style={{ background:mc.color }}>{mc.icon} {mc.verb} {cart.length} {cart.length===1?'element':cart.length<5?'elementy':'elementów'} →</button>
          </div>
        )}
      </div>
    </>
  );
}

function CatalogView({ equipment, users, onBack }) {
  const [query, setQuery] = useState('');
  const filtered = equipment.filter(e => !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.code.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="fade-in" style={{ padding:'16px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
        <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Katalog sprzętu</div>
      </div>
      <input className="search-input" placeholder="🔍 Szukaj po nazwie lub kodzie..." value={query} onChange={e=>setQuery(e.target.value)} style={{ marginBottom:14 }} />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.map(item => {
          const isWarehouse = item.location==='warehouse';
          const isAssigned = !!item.assigned_to;
          const assignedUser = isAssigned ? users.find(u=>u.id===item.assigned_to) : null;
          return (
            <div key={item.id} className="card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:24 }}>{CATEGORIES[item.cat]?.icon||'📦'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'#ddd', fontSize:13, fontWeight:600 }}>{item.name}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#888', marginTop:3 }}>{item.code}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
                {isAssigned && <div style={{ padding:'2px 7px', borderRadius:5, fontSize:10, fontWeight:600, background:'#1a1a2a', color:'#818CF8', border:'1px solid #818CF833', whiteSpace:'nowrap' }}>📌 {assignedUser?.name||'Przypisany'}</div>}
                <div style={{ padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600, background:isWarehouse?'#1a2a1a':'#2a2a1a', color:isWarehouse?'#22C55E':'#FBB724', border:`1px solid ${isWarehouse?'#22C55E33':'#FBB72433'}`, whiteSpace:'nowrap' }}>{getLocationLabel(item.location, users)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryView({ history, users, onBack }) {
  const [filterUser, setFilterUser] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const filtered = [...history].filter(tx => filterUser==='all'||tx.userId===filterUser).filter(tx => filterType==='all'||tx.mode===filterType);
  const displayed = sortOrder==='desc' ? [...filtered].reverse() : filtered;
  const selectStyle = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 10px', color:'#ddd', fontSize:12, outline:'none', fontFamily:'Barlow,sans-serif', cursor:'pointer', flex:1 };
  return (
    <div className="fade-in" style={{ padding:'16px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
        <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Historia operacji</div>
        <div style={{ color:'#888', fontSize:12, marginLeft:'auto' }}>{displayed.length}/{history.length}</div>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={selectStyle}>
          <option value="all">Wszyscy</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={selectStyle}>
          <option value="all">Pobrano i zwrócono</option>
          <option value="checkout">📤 Tylko pobrano</option>
          <option value="return">📥 Tylko zwrócono</option>
        </select>
        <button onClick={()=>setSortOrder(o=>o==='desc'?'asc':'desc')} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 12px', color:'#aaa', fontSize:12, cursor:'pointer', fontFamily:'Barlow,sans-serif', flexShrink:0 }}>
          {sortOrder==='desc'?'↓ Najnowsze':'↑ Najstarsze'}
        </button>
      </div>
      {displayed.length===0 ? (
        <div style={{ color:'#555', textAlign:'center', padding:60, fontSize:14 }}>📋<br/><br/>Brak operacji</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {displayed.map((tx,idx) => {
            const user = users.find(u=>u.id===tx.userId);
            const isCheckout = tx.mode==='checkout';
            return (
              <div key={idx} className="card" style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:isCheckout?'#2a2210':'#1a2a1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{isCheckout?'📤':'📥'}</div>
                  <div style={{ flex:1 }}>
                    <span style={{ color:isCheckout?'#FBB724':'#22C55E', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{isCheckout?'Pobrano':'Zwrócono'}</span>
                    <div style={{ color:'#ccc', fontSize:13, fontWeight:600, marginTop:2 }}>{user?.name||'Użytkownik'}</div>
                  </div>
                  <div style={{ color:'#666', fontSize:10, fontFamily:'DM Mono,monospace', textAlign:'right' }}>{tx.time}</div>
                </div>
                <div style={{ paddingLeft:42 }}>
                  {tx.items.map(item => (
                    <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#888', padding:'2px 0' }}>
                      <span>{CATEGORIES[item.cat]?.icon||'📦'}</span>
                      <span style={{ flex:1 }}>{item.name}</span>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#666' }}>{item.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PrintCodesView({ equipment, onBack }) {
  return (
    <div className="print-page" style={{ padding:'20px', minHeight:'100vh', background:'#fff', color:'#000' }}>
      <div className="no-print" style={{ marginBottom:20, maxWidth:800, margin:'0 auto 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px', color:'#666', borderColor:'#ccc' }}>← Powrót</button>
        <div style={{ flex:1, color:'#222', fontWeight:700, fontSize:18 }}>🖨️ Naklejki do druku ({equipment.length} szt.)</div>
        <button onClick={()=>window.print()} style={{ background:'#FBB724', color:'#000', border:'none', padding:'10px 18px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14 }}>🖨️ Drukuj</button>
      </div>
      <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
        {equipment.map(item => (
          <div key={item.id} className="qr-print-item" style={{ border:'2px solid #ddd', borderRadius:8, padding:'12px 8px', textAlign:'center', background:'#fff', breakInside:'avoid' }}>
            <div style={{ background:'#fff', padding:'4px', display:'inline-block' }}>
              <QRCodeSVG value={item.code} size={110} level="M" />
            </div>
            <div style={{ fontFamily:'monospace', fontWeight:'bold', fontSize:14, marginTop:8, color:'#000' }}>{item.code}</div>
            <div style={{ fontSize:10, color:'#666', marginTop:3, maxWidth:140, margin:'3px auto 0', lineHeight:1.3 }}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [equipment,   setEquipment]   = useState([]);
  const [history,     setHistory]     = useState([]);
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState(false);
  const [adminPassword]               = useState(DEFAULT_ADMIN_PASSWORD);
  const [currentUser, setCurrentUser] = useState(null);
  const [view,        setView]        = useState('login');
  const [scanMode,    setScanMode]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setDbError(false);
    try {
      const [eqRes, usersRes, histRes] = await Promise.all([
        supabase.from('equipment').select('*'),
        supabase.from('users').select('*'),
        supabase.from('history').select('*').order('id', { ascending:true }),
      ]);
      if (eqRes.error) throw eqRes.error;
      if (usersRes.error) throw usersRes.error;
      if (histRes.error) throw histRes.error;
      setEquipment(eqRes.data||[]);
      setUsers(usersRes.data||[]);
      setHistory((histRes.data||[]).map(h => ({ dbId:h.id, mode:h.mode, userId:h.user_id, items:h.items, time:h.time })));
    } catch(e) { console.error('DB error:', e); setDbError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const channel = supabase.channel('studio-changes')
      .on('postgres_changes', { event:'*', schema:'public', table:'equipment' }, (payload) => {
        if (payload.eventType==='UPDATE') setEquipment(prev => prev.map(e => e.id===payload.new.id ? payload.new : e));
        else if (payload.eventType==='INSERT') setEquipment(prev => prev.find(e=>e.id===payload.new.id) ? prev : [...prev, payload.new]);
        else if (payload.eventType==='DELETE') setEquipment(prev => prev.filter(e => e.id!==payload.old.id));
      })
      .on('postgres_changes', { event:'*', schema:'public', table:'users' }, (payload) => {
        if (payload.eventType==='INSERT') setUsers(prev => prev.find(u=>u.id===payload.new.id) ? prev : [...prev, payload.new]);
        else if (payload.eventType==='DELETE') setUsers(prev => prev.filter(u => u.id!==payload.old.id));
      })
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'history' }, (payload) => {
        const h = payload.new;
        setHistory(prev => { if (prev.find(x=>x.dbId===h.id)) return prev; return [...prev, { dbId:h.id, mode:h.mode, userId:h.user_id, items:h.items, time:h.time }]; });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState==='visible') fetchAll(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchAll]);

  const handleSaveUsers = async (newUsers) => {
    const added = newUsers.filter(u => !users.find(o=>o.id===u.id));
    const deleted = users.filter(u => !newUsers.find(n=>n.id===u.id));
    setUsers(newUsers);
    if (added.length) await supabase.from('users').insert(added);
    if (deleted.length) await Promise.all(deleted.map(u => supabase.from('users').delete().eq('id', u.id)));
  };

  const handleSaveEquipment = async (newEquipment) => {
    const added = newEquipment.filter(e => !equipment.find(o=>o.id===e.id));
    const deleted = equipment.filter(e => !newEquipment.find(n=>n.id===e.id));
    setEquipment(newEquipment);
    if (added.length) await supabase.from('equipment').insert(added);
    if (deleted.length) await Promise.all(deleted.map(e => supabase.from('equipment').delete().eq('id', e.id)));
  };

  const handleAssign = async (itemId, userId) => {
    const newLocation = userId || 'warehouse';
    setEquipment(prev => prev.map(e => e.id===itemId ? { ...e, assigned_to: userId||null, location: newLocation } : e));
    await supabase.from('equipment').update({ assigned_to: userId||null, location: newLocation }).eq('id', itemId);
  };

  const handleConfirm = async ({ mode, cart }) => {
    const newLocation = mode==='checkout' ? currentUser.id : 'warehouse';
    setEquipment(prev => prev.map(item => cart.find(c=>c.id===item.id) ? { ...item, location:newLocation } : item));
    await Promise.all([
      ...cart.map(item => supabase.from('equipment').update({ location:newLocation }).eq('id', item.id)),
      supabase.from('history').insert({ mode, user_id:currentUser.id, items:cart.map(c=>({id:c.id,code:c.code,name:c.name,cat:c.cat})), time:now() }),
    ]);
  };

  const handleReset = async () => {
    if (!confirm('Czy na pewno zresetować WSZYSTKIE dane?\n\nUsuwa cały sprzęt, użytkowników i historię.')) return;
    await Promise.all([supabase.from('history').delete().neq('id',0), supabase.from('equipment').delete().neq('id',''), supabase.from('users').delete().neq('id','')]);
    setEquipment([]); setHistory([]); setUsers([]);
  };

  const handleLogin = (user) => { setCurrentUser(user); setView('home'); };
  const handleLogout = () => { setCurrentUser(null); setView('login'); };
  const handleAction = (action) => {
    if (action==='checkout'||action==='return') { setScanMode(action); setView('scan'); }
    else setView(action);
  };

  if (loading) return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <style>{STYLES}</style>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize:48 }}>📷</div>
      <div style={{ color:'#fff', fontWeight:700, fontSize:20 }}>Studio Inventory</div>
      <div style={{ color:'#666', fontSize:14 }}>Łączenie z bazą danych...</div>
      <div style={{ width:36, height:36, border:'3px solid #333', borderTopColor:'#FBB724', borderRadius:18, animation:'spin 1s linear infinite' }} />
    </div>
  );

  if (dbError) return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
      <style>{STYLES}</style>
      <div style={{ fontSize:48 }}>⚠️</div>
      <div style={{ color:'#fff', fontWeight:700, fontSize:20 }}>Błąd połączenia</div>
      <div style={{ color:'#888', fontSize:14, textAlign:'center' }}>Nie można połączyć się z bazą danych. Sprawdź internet.</div>
      <button className="btn-primary" onClick={fetchAll} style={{ maxWidth:240 }}>🔄 Spróbuj ponownie</button>
    </div>
  );

  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', color:'#fff', fontFamily:'Barlow,sans-serif' }}>
      <style>{STYLES}</style>
      {view==='login' && <LoginView users={users} onLogin={handleLogin} onReset={handleReset} onPrintCodes={()=>setView('print')} onAdmin={()=>setView('admin-login')} />}
      {view==='admin-login' && <AdminLoginView adminPassword={adminPassword} onLogin={()=>setView('admin')} onBack={()=>setView('login')} />}
      {view==='admin' && <AdminView users={users} equipment={equipment} onSaveUsers={handleSaveUsers} onSaveEquipment={handleSaveEquipment} onAssign={handleAssign} onBack={()=>setView('login')} />}
      {view==='home' && currentUser && <HomeView user={currentUser} equipment={equipment} history={history} onAction={handleAction} onLogout={handleLogout} onAssign={handleAssign} />}
      {view==='scan' && currentUser && <ScanView user={currentUser} equipment={equipment} users={users} mode={scanMode} onConfirm={handleConfirm} onBack={()=>setView('home')} />}
      {view==='catalog' && <CatalogView equipment={equipment} users={users} onBack={()=>setView('home')} />}
      {view==='history' && <HistoryView history={history} users={users} onBack={()=>setView('home')} />}
      {view==='print' && <PrintCodesView equipment={equipment} onBack={()=>setView('login')} />}
    </div>
  );
}
