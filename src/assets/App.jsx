import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';

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

  .btn-primary {
    background: #FBB724; color: #0C0C0C;
    font: 700 15px/1 'Barlow',sans-serif; letter-spacing:.02em;
    border: none; border-radius: 10px; padding: 14px 22px;
    cursor: pointer; transition: all .15s ease; width: 100%;
  }
  .btn-primary:hover { background: #F5A500; }
  .btn-primary:disabled { opacity: .35; cursor: not-allowed; }

  .btn-scan {
    background: #1a1a1a; color: #FBB724;
    font: 700 14px/1 'Barlow',sans-serif;
    border: 2px solid #FBB724; border-radius: 10px; padding: 14px 18px;
    cursor: pointer; transition: all .15s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-scan:hover { background: #FBB72422; }
  .btn-scan:active { transform: scale(.98); }

  .btn-ghost {
    background: transparent; color: #888;
    font: 600 13px/1 'Barlow',sans-serif;
    border: 1px solid #252525; border-radius: 8px; padding: 10px 16px;
    cursor: pointer; transition: all .15s ease;
  }
  .btn-ghost:hover { border-color: #3a3a3a; color: #ccc; }

  .card { background: #141414; border: 1px solid #202020; border-radius: 12px; }

  .scannable-item {
    background: #141414; border: 1.5px solid #1E1E1E;
    border-radius: 10px; padding: 12px 14px;
    cursor: pointer; transition: all .12s ease;
    display: flex; align-items: center; gap: 12px; user-select: none;
  }
  .scannable-item:hover { border-color: #333; }
  .scannable-item.in-cart { border-color: #22C55E; background: rgba(34,197,94,.06); }
  .scannable-item.flash { animation: flashAnim .5s ease-out; }
  @keyframes flashAnim {
    0% { background: rgba(251,183,36,.3); border-color: #FBB724; transform: scale(1.02); }
    100% { background: #141414; transform: scale(1); }
  }

  .action-tile {
    background: #141414; border: 1.5px solid #1E1E1E;
    border-radius: 12px; padding: 18px;
    cursor: pointer; transition: all .18s ease; text-align: left; width: 100%;
  }
  .action-tile:hover { border-color: #FBB724; transform: translateY(-2px); }

  .code-input {
    width: 100%; background: #1a1a1a; border: 2px solid #FBB72444;
    border-radius: 12px; padding: 14px 16px;
    color: #FBB724; font: 700 16px/1 'DM Mono',monospace;
    outline: none; transition: all .15s; letter-spacing: .05em;
    text-transform: uppercase;
  }
  .code-input:focus { border-color: #FBB724; }
  .code-input::placeholder { color: #4a4a4a; }

  .search-input {
    width: 100%; background: #141414; border: 1px solid #202020; border-radius: 9px;
    padding: 10px 14px; color: #ddd; font: 400 14px/1 'Barlow',sans-serif;
    outline: none;
  }
  .search-input:focus { border-color: #333; }

  /* Scanner overlay */
  .scanner-overlay {
    position: fixed; inset: 0; background: #000; z-index: 1000;
    display: flex; flex-direction: column;
  }
  .scanner-overlay video { object-fit: cover !important; }

  /* Print styles */
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .print-page { background: white !important; color: black !important; }
    .qr-print-item { border: 1px solid #ddd !important; page-break-inside: avoid; }
  }
`;

const USERS = [
  { id: 'u1', name: 'Anna Kowalska',    role: 'Fotograf modelkowy',    initials: 'AK', color: '#FBB724' },
  { id: 'u2', name: 'Marek Nowak',      role: 'Fotograf produktowy',   initials: 'MN', color: '#34D399' },
  { id: 'u3', name: 'Zofia Wiśniewska', role: 'Zespół produkcyjny',    initials: 'ZW', color: '#818CF8' },
  { id: 'u4', name: 'Piotr Zając',      role: 'Zespół zewnętrzny',     initials: 'PZ', color: '#FB7185' },
];

const CATEGORIES = {
  STAT: { name: 'Statywy', icon: '📐' },
  LAMP: { name: 'Lampy', icon: '💡' },
  SOFT: { name: 'Softboxy', icon: '🔲' },
  TRIG: { name: 'Wyzwalacze', icon: '📡' },
  BATT: { name: 'Baterie', icon: '🔋' },
  BGND: { name: 'Tła', icon: '🖼️' },
};

const INITIAL_EQUIPMENT = [
  { id:'e1',  code:'STAT-001', name:'Statyw Manfrotto 055',     cat:'STAT', location:'warehouse' },
  { id:'e2',  code:'STAT-002', name:'Statyw Manfrotto MT055',   cat:'STAT', location:'warehouse' },
  { id:'e3',  code:'STAT-003', name:'Statyw Gitzo GT3543',      cat:'STAT', location:'warehouse' },
  { id:'e4',  code:'STAT-004', name:'Statyw Benro A373F',       cat:'STAT', location:'warehouse' },
  { id:'e5',  code:'STAT-005', name:'Statyw Velbon Sherpa',     cat:'STAT', location:'warehouse' },
  { id:'e6',  code:'LAMP-001', name:'Lampa Godox AD600 #1',     cat:'LAMP', location:'warehouse' },
  { id:'e7',  code:'LAMP-002', name:'Lampa Godox AD600 #2',     cat:'LAMP', location:'warehouse' },
  { id:'e8',  code:'LAMP-003', name:'Lampa Godox AD400 #1',     cat:'LAMP', location:'warehouse' },
  { id:'e9',  code:'LAMP-004', name:'Lampa Godox AD400 #2',     cat:'LAMP', location:'warehouse' },
  { id:'e10', code:'LAMP-005', name:'Lampa Elinchrom 500 #1',   cat:'LAMP', location:'warehouse' },
  { id:'e11', code:'LAMP-006', name:'Lampa Elinchrom 500 #2',   cat:'LAMP', location:'warehouse' },
  { id:'e12', code:'LAMP-007', name:'Lampa Profoto D2 500 #1',  cat:'LAMP', location:'warehouse' },
  { id:'e13', code:'LAMP-008', name:'Lampa Profoto D2 500 #2',  cat:'LAMP', location:'warehouse' },
  { id:'e14', code:'LAMP-009', name:'Lampa LED Godox SL60 #1',  cat:'LAMP', location:'warehouse' },
  { id:'e15', code:'LAMP-010', name:'Lampa LED Godox SL60 #2',  cat:'LAMP', location:'warehouse' },
  { id:'e16', code:'SOFT-001', name:'Softbox Godox 120cm',      cat:'SOFT', location:'warehouse' },
  { id:'e17', code:'SOFT-002', name:'Softbox Godox 80cm',       cat:'SOFT', location:'warehouse' },
  { id:'e18', code:'SOFT-003', name:'Softbox Profoto 90cm',     cat:'SOFT', location:'warehouse' },
  { id:'e19', code:'SOFT-004', name:'Softbox Elinchrom 100cm',  cat:'SOFT', location:'warehouse' },
  { id:'e20', code:'SOFT-005', name:'Softbox prostokątny 60x90',cat:'SOFT', location:'warehouse' },
  { id:'e21', code:'TRIG-001', name:'Wyzwalacz Godox X2T-N',    cat:'TRIG', location:'warehouse' },
  { id:'e22', code:'TRIG-002', name:'Wyzwalacz Godox X2T-C',    cat:'TRIG', location:'warehouse' },
  { id:'e23', code:'TRIG-003', name:'Wyzwalacz Profoto Air',    cat:'TRIG', location:'warehouse' },
  { id:'e24', code:'BATT-001', name:'Bateria Godox WB87 #1',    cat:'BATT', location:'warehouse' },
  { id:'e25', code:'BATT-002', name:'Bateria Godox WB87 #2',    cat:'BATT', location:'warehouse' },
  { id:'e26', code:'BATT-003', name:'Bateria Profoto B10 #1',   cat:'BATT', location:'warehouse' },
  { id:'e27', code:'BATT-004', name:'Bateria Profoto B10 #2',   cat:'BATT', location:'warehouse' },
  { id:'e28', code:'BATT-005', name:'Powerbank 20000mAh',       cat:'BATT', location:'warehouse' },
  { id:'e29', code:'BGND-001', name:'Tło bezszwowe białe',      cat:'BGND', location:'warehouse' },
  { id:'e30', code:'BGND-002', name:'Tło bezszwowe szare',      cat:'BGND', location:'warehouse' },
];

const STORAGE_KEY = 'studio_inventory_v1';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        equipment: parsed.equipment || INITIAL_EQUIPMENT,
        history: parsed.history || []
      };
    }
  } catch (e) { console.error('Load error:', e); }
  return { equipment: INITIAL_EQUIPMENT, history: [] };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.error('Save error:', e); }
}

function now() {
  const d = new Date();
  return `${d.toLocaleDateString('pl-PL')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

const getLocationLabel = (loc) => {
  if (loc === 'warehouse') return 'Magazyn';
  const user = USERS.find(u => u.id === loc);
  return user ? user.name : loc;
};

function Avatar({ user, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: user.color+'1A', border: `1.5px solid ${user.color}44`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color: user.color, fontFamily:'DM Mono,monospace',
      fontWeight:500, fontSize: size*.34, flexShrink:0,
    }}>{user.initials}</div>
  );
}

/* ── QR SCANNER MODAL ──────────────────────────────────────────────────────── */
function QRScannerModal({ onScan, onClose, scannedCount }) {
  const [recentCodes, setRecentCodes] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);

  const handleDetected = (results) => {
    if (!results || results.length === 0) return;
    const code = results[0].rawValue?.toUpperCase().trim();
    if (!code) return;

    // Prevent rapid duplicate scans (2s cooldown per code)
    if (recentCodes.includes(code)) return;
    setRecentCodes(prev => [...prev, code]);
    setTimeout(() => {
      setRecentCodes(prev => prev.filter(c => c !== code));
    }, 2000);

    // Vibrate (mobile)
    if (navigator.vibrate) navigator.vibrate(80);

    const result = onScan(code);
    setLastFeedback({ code, ok: result.ok, msg: result.msg });
    setTimeout(() => setLastFeedback(null), 2500);
  };

  return (
    <div className="scanner-overlay">
      {/* Top bar */}
      <div style={{ padding:'16px 20px', background:'#0C0C0C', borderBottom:'1px solid #222',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>📷 Skanuj kod QR</div>
          <div style={{ color:'#666', fontSize:12, marginTop:2 }}>
            Zeskanowane: {scannedCount}
          </div>
        </div>
        <button className="btn-primary" onClick={onClose}
          style={{ width:'auto', padding:'10px 20px', fontSize:14 }}>
          ✓ Gotowe
        </button>
      </div>

      {/* Scanner area */}
      <div style={{ flex:1, position:'relative', background:'#000', overflow:'hidden' }}>
        <Scanner
          onScan={handleDetected}
          onError={(err) => console.error('Scanner error:', err)}
          constraints={{ facingMode: 'environment' }}
          styles={{
            container: { width:'100%', height:'100%' },
            video: { width:'100%', height:'100%', objectFit:'cover' }
          }}
        />

        {/* Viewfinder overlay */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{
            width:'70%', maxWidth:280, aspectRatio:'1',
            border:'3px solid #FBB724', borderRadius:16,
            boxShadow:'0 0 0 9999px rgba(0,0,0,0.4)'
          }} />
        </div>

        {/* Feedback toast */}
        {lastFeedback && (
          <div className="slide-up" style={{
            position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
            background: lastFeedback.ok ? 'rgba(34,197,94,0.95)' : 'rgba(248,113,113,0.95)',
            color:'#fff', padding:'12px 20px', borderRadius:10,
            fontWeight:600, fontSize:14, maxWidth:'85%', textAlign:'center',
            boxShadow:'0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {lastFeedback.ok ? '✓ ' : '⚠️ '}
            <strong>{lastFeedback.code}</strong>
            {lastFeedback.msg && <div style={{ fontSize:12, marginTop:4, opacity:.9 }}>{lastFeedback.msg}</div>}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ padding:'14px 20px', background:'#0C0C0C', borderTop:'1px solid #222',
        textAlign:'center', color:'#888', fontSize:12 }}>
        Skieruj aparat na kod QR na naklejce
      </div>
    </div>
  );
}

/* ── LOGIN ─────────────────────────────────────────────────────────────────── */
function LoginView({ onLogin, onReset, onPrintCodes }) {
  return (
    <div className="fade-in" style={{ padding:'0 20px 40px', maxWidth:440, margin:'0 auto' }}>
      <div style={{ textAlign:'center', padding:'40px 0 28px' }}>
        <div style={{ fontSize:42, marginBottom:10 }}>📷</div>
        <div style={{ color:'#fff', fontWeight:800, fontSize:26 }}>Studio Inventory</div>
        <div style={{ color:'#666', fontSize:13, marginTop:6 }}>BETA — Test z aparatem</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
        {USERS.map(u => (
          <div key={u.id} className="card" onClick={() => onLogin(u)}
            style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
            <Avatar user={u} size={44} />
            <div style={{ flex:1 }}>
              <div style={{ color:'#eee', fontWeight:600, fontSize:15 }}>{u.name}</div>
              <div style={{ color:'#555', fontSize:12, marginTop:2 }}>{u.role}</div>
            </div>
            <div style={{ color:'#444' }}>→</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:24 }}>
        <button className="btn-ghost" onClick={onPrintCodes} style={{ fontSize:11 }}>
          🖨️ Drukuj kody QR
        </button>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize:11 }}>
          🔄 Resetuj dane
        </button>
      </div>
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────────────────────────── */
function HomeView({ user, equipment, history, onAction, onLogout }) {
  const myItems = equipment.filter(e => e.location === user.id);
  const warehouseCount = equipment.filter(e => e.location === 'warehouse').length;
  const myHistory = history.filter(h => h.userId === user.id).length;

  return (
    <div className="fade-in" style={{ padding:'20px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Avatar user={user} size={46} />
        <div style={{ flex:1 }}>
          <div style={{ color:'#555', fontSize:12 }}>Zalogowany jako</div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>{user.name}</div>
        </div>
        <button className="btn-ghost" onClick={onLogout} style={{ padding:'6px 10px', fontSize:11 }}>
          Wyloguj
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24 }}>
        <div className="card" style={{ padding:14, textAlign:'center' }}>
          <div style={{ color:'#FBB724', fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace', lineHeight:1 }}>{myItems.length}</div>
          <div style={{ color:'#555', fontSize:11, marginTop:4 }}>U Ciebie</div>
        </div>
        <div className="card" style={{ padding:14, textAlign:'center' }}>
          <div style={{ color:'#22C55E', fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace', lineHeight:1 }}>{warehouseCount}</div>
          <div style={{ color:'#555', fontSize:11, marginTop:4 }}>Magazyn</div>
        </div>
        <div className="card" style={{ padding:14, textAlign:'center' }}>
          <div style={{ color:'#818CF8', fontWeight:800, fontSize:28, fontFamily:'DM Mono,monospace', lineHeight:1 }}>{myHistory}</div>
          <div style={{ color:'#555', fontSize:11, marginTop:4 }}>Twoje akcje</div>
        </div>
      </div>

      {myItems.length > 0 && (
        <div style={{ marginBottom:22 }}>
          <div style={{ color:'#3a3a3a', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>
            Sprzęt u Ciebie ({myItems.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {myItems.map(item => (
              <div key={item.id} className="card" style={{ padding:'10px 13px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{CATEGORIES[item.cat].icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#ccc', fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {item.name}
                  </div>
                </div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#666' }}>{item.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ color:'#3a3a3a', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>
        Akcje
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <button className="action-tile" onClick={() => onAction('checkout')}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>📤</span>
            <div>
              <div style={{ color:'#eee', fontWeight:700, fontSize:15 }}>Pobierz sprzęt</div>
              <div style={{ color:'#555', fontSize:12, marginTop:2 }}>Z magazynu — zeskanuj QR lub wpisz kod</div>
            </div>
          </div>
        </button>

        {myItems.length > 0 && (
          <button className="action-tile" onClick={() => onAction('return')}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28 }}>📥</span>
              <div>
                <div style={{ color:'#eee', fontWeight:700, fontSize:15 }}>Zwróć do magazynu</div>
                <div style={{ color:'#555', fontSize:12, marginTop:2 }}>Twój sprzęt wraca do magazynu</div>
              </div>
            </div>
          </button>
        )}

        <button className="action-tile" onClick={() => onAction('catalog')}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>🔍</span>
            <div>
              <div style={{ color:'#eee', fontWeight:700, fontSize:15 }}>Katalog sprzętu</div>
              <div style={{ color:'#555', fontSize:12, marginTop:2 }}>Zobacz gdzie jest jaki sprzęt</div>
            </div>
          </div>
        </button>

        <button className="action-tile" onClick={() => onAction('history')}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>📋</span>
            <div>
              <div style={{ color:'#eee', fontWeight:700, fontSize:15 }}>Historia operacji</div>
              <div style={{ color:'#555', fontSize:12, marginTop:2 }}>{history.length} {history.length === 1 ? 'operacja' : 'operacji'}</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ── SCAN VIEW (Checkout / Return) ────────────────────────────────────────── */
function ScanView({ user, equipment, mode, onConfirm, onBack }) {
  const [codeInput, setCodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [flashId, setFlashId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const mc = mode === 'checkout'
    ? { title:'Pobierz sprzęt', verb:'Pobierz', color:'#FBB724', icon:'📤', source:'magazyn' }
    : { title:'Zwróć sprzęt', verb:'Zwróć', color:'#34D399', icon:'📥', source:'sprzęt u Ciebie' };

  const availableItems = mode === 'checkout'
    ? equipment.filter(e => e.location === 'warehouse')
    : equipment.filter(e => e.location === user.id);

  const tryAddCode = (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, msg: 'Pusty kod' };

    const item = availableItems.find(e => e.code === code);
    if (!item) {
      const exists = equipment.find(e => e.code === code);
      if (exists) {
        const msg = mode === 'checkout'
          ? `Nie w magazynie (u: ${getLocationLabel(exists.location)})`
          : `Nie u Ciebie (u: ${getLocationLabel(exists.location)})`;
        return { ok: false, msg };
      }
      return { ok: false, msg: 'Nieznany kod' };
    }

    if (cart.find(c => c.id === item.id)) {
      return { ok: false, msg: 'Już dodany' };
    }

    setCart(prev => [...prev, item]);
    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 500);
    return { ok: true, msg: item.name };
  };

  const handleAddByCode = () => {
    const result = tryAddCode(codeInput);
    if (!result.ok) {
      setErrorMsg(result.msg);
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      setCodeInput('');
    }
  };

  const handleItemClick = (item) => {
    const inCart = cart.find(c => c.id === item.id);
    if (inCart) {
      setCart(cart.filter(c => c.id !== item.id));
    } else {
      setCart([...cart, item]);
      setFlashId(item.id);
      setTimeout(() => setFlashId(null), 400);
    }
  };

  const handleScannerScan = (code) => {
    return tryAddCode(code);
  };

  const handleConfirm = () => {
    onConfirm({ mode, cart });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="fade-in" style={{ padding:24, maxWidth:480, margin:'0 auto',
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:14 }}>
        <div style={{ width:72, height:72, borderRadius:36, background:'#1a2a1a',
          border:'2px solid #22C55E', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:34 }}>✅</div>
        <div style={{ color:'#fff', fontWeight:800, fontSize:22 }}>Gotowe!</div>
        <div style={{ color:'#888', fontSize:14, textAlign:'center' }}>
          {mode === 'checkout' ? 'Pobrano' : 'Zwrócono'} {cart.length} {cart.length === 1 ? 'element' : cart.length < 5 ? 'elementy' : 'elementów'}
        </div>
        <button className="btn-primary" onClick={onBack} style={{ marginTop:8 }}>
          ← Powrót do menu
        </button>
      </div>
    );
  }

  return (
    <>
      {scannerOpen && (
        <QRScannerModal
          onScan={handleScannerScan}
          onClose={() => setScannerOpen(false)}
          scannedCount={cart.length}
        />
      )}

      <div style={{ padding:'16px 20px 200px', maxWidth:480, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>{mc.title}</div>
            <div style={{ color:'#555', fontSize:12, marginTop:1 }}>Źródło: {mc.source}</div>
          </div>
          {cart.length > 0 && (
            <div style={{ background:mc.color+'22', color:mc.color,
              fontFamily:'DM Mono,monospace', fontWeight:700, fontSize:15,
              width:36, height:36, borderRadius:8,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {cart.length}
            </div>
          )}
        </div>

        {/* Scan button - PROMINENT */}
        <button className="btn-scan" onClick={() => setScannerOpen(true)}
          style={{ width:'100%', padding:'18px', marginBottom:12, fontSize:16 }}>
          📷 Skanuj kod QR aparatem
        </button>

        {/* Manual code input */}
        <div className="card" style={{ padding:12, marginBottom:14 }}>
          <div style={{ color:'#666', fontSize:11, marginBottom:8, letterSpacing:'.05em', textTransform:'uppercase' }}>
            Lub wpisz kod ręcznie
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input
              type="text"
              className="code-input"
              placeholder="STAT-001"
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setErrorMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAddByCode()}
            />
            <button className="btn-primary"
              onClick={handleAddByCode}
              disabled={!codeInput.trim()}
              style={{ width:'auto', padding:'0 20px', flexShrink:0, fontSize:13 }}>
              Dodaj
            </button>
          </div>
          {errorMsg && (
            <div className="slide-up" style={{ color:'#F87171', fontSize:12, marginTop:8 }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* List of available items */}
        <div style={{ color:'#3a3a3a', fontSize:11, fontWeight:700, letterSpacing:'.1em',
          textTransform:'uppercase', marginBottom:10 }}>
          Lub wybierz z listy ({availableItems.length})
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {availableItems.length === 0 && (
            <div style={{ color:'#444', textAlign:'center', padding:40, fontSize:14 }}>
              {mode === 'checkout' ? 'Magazyn jest pusty' : 'Nie masz żadnego sprzętu'}
            </div>
          )}
          {availableItems.map(item => {
            const inCart = !!cart.find(c => c.id === item.id);
            const flashing = flashId === item.id;
            return (
              <div key={item.id}
                className={`scannable-item${inCart ? ' in-cart' : ''}${flashing ? ' flash' : ''}`}
                onClick={() => handleItemClick(item)}>
                <span style={{ fontSize:22 }}>{CATEGORIES[item.cat].icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color: inCart ? '#86EFAC' : '#ccc', fontSize:13, fontWeight:500 }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#666', marginTop:3 }}>
                    {item.code}
                  </div>
                </div>
                <div style={{ width:24, height:24, borderRadius:12,
                  border:`2px solid ${inCart ? '#22C55E' : '#252525'}`,
                  background: inCart ? '#22C55E' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, color:'#0A0A0A', fontWeight:800, flexShrink:0 }}>
                  {inCart && '✓'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm button */}
        {cart.length > 0 && (
          <div className="slide-up" style={{ position:'fixed', bottom:0, left:'50%',
            transform:'translateX(-50%)', width:'100%', maxWidth:480, padding:'12px 20px 20px',
            background:'linear-gradient(to top, #0C0C0C 80%, transparent)' }}>
            <div className="card" style={{ padding:'10px 13px', marginBottom:8 }}>
              <div style={{ color:'#eee', fontSize:13, fontWeight:600 }}>
                Wybrano: {cart.length} {cart.length === 1 ? 'element' : cart.length < 5 ? 'elementy' : 'elementów'}
              </div>
              <div style={{ color:'#666', fontSize:11, fontFamily:'DM Mono,monospace', marginTop:3 }}>
                {cart.map(i => i.code).join(' · ')}
              </div>
            </div>
            <button className="btn-primary" onClick={handleConfirm}
              style={{ background: mc.color }}>
              {mc.icon} {mc.verb} {cart.length} {cart.length === 1 ? 'element' : cart.length < 5 ? 'elementy' : 'elementów'} →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── CATALOG ──────────────────────────────────────────────────────────────── */
function CatalogView({ equipment, onBack }) {
  const [query, setQuery] = useState('');
  const filtered = equipment.filter(e =>
    !query || e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ padding:'16px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
        <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Katalog sprzętu</div>
      </div>

      <input className="search-input" placeholder="🔍 Szukaj po nazwie lub kodzie..."
        value={query} onChange={e => setQuery(e.target.value)}
        style={{ marginBottom:14 }} />

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.map(item => {
          const isWarehouse = item.location === 'warehouse';
          return (
            <div key={item.id} className="card" style={{ padding:'12px 14px',
              display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:24 }}>{CATEGORIES[item.cat].icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'#ddd', fontSize:13, fontWeight:600 }}>{item.name}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#555', marginTop:3 }}>{item.code}</div>
              </div>
              <div style={{
                padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600,
                background: isWarehouse ? '#1a2a1a' : '#2a2a1a',
                color: isWarehouse ? '#22C55E' : '#FBB724',
                border: `1px solid ${isWarehouse ? '#22C55E33' : '#FBB72433'}`,
                whiteSpace:'nowrap'
              }}>
                {getLocationLabel(item.location)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── HISTORY ──────────────────────────────────────────────────────────────── */
function HistoryView({ history, onBack }) {
  return (
    <div className="fade-in" style={{ padding:'16px 20px 40px', maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px' }}>←</button>
        <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Historia operacji</div>
      </div>

      {history.length === 0 ? (
        <div style={{ color:'#444', textAlign:'center', padding:60, fontSize:14 }}>
          📋<br/><br/>Brak operacji do wyświetlenia
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[...history].reverse().map((tx, idx) => {
            const user = USERS.find(u => u.id === tx.userId);
            const isCheckout = tx.mode === 'checkout';
            return (
              <div key={idx} className="card" style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{
                    width:32, height:32, borderRadius:8,
                    background: isCheckout ? '#2a2210' : '#1a2a1a',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:16
                  }}>
                    {isCheckout ? '📤' : '📥'}
                  </div>
                  <div style={{ flex:1 }}>
                    <span style={{
                      color: isCheckout ? '#FBB724' : '#22C55E',
                      fontSize:11, fontWeight:700, textTransform:'uppercase'
                    }}>
                      {isCheckout ? 'Pobrano' : 'Zwrócono'}
                    </span>
                    <div style={{ color:'#ccc', fontSize:13, fontWeight:600, marginTop:2 }}>
                      {user?.name || 'Użytkownik'}
                    </div>
                  </div>
                  <div style={{ color:'#444', fontSize:10, fontFamily:'DM Mono,monospace', textAlign:'right' }}>
                    {tx.time}
                  </div>
                </div>
                <div style={{ paddingLeft:42 }}>
                  {tx.items.map(item => (
                    <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#888', padding:'2px 0' }}>
                      <span>{CATEGORIES[item.cat].icon}</span>
                      <span style={{ flex:1 }}>{item.name}</span>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#555' }}>{item.code}</span>
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

/* ── PRINT QR CODES ───────────────────────────────────────────────────────── */
function PrintCodesView({ equipment, onBack }) {
  return (
    <div className="print-page" style={{ padding:'20px', minHeight:'100vh', background:'#fff', color:'#000' }}>
      <div className="no-print" style={{ marginBottom:20, maxWidth:800, margin:'0 auto 20px',
        display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn-ghost" onClick={onBack} style={{ padding:'8px 12px', color:'#666', borderColor:'#ccc' }}>
          ← Powrót
        </button>
        <div style={{ flex:1, color:'#222', fontWeight:700, fontSize:18 }}>
          🖨️ Naklejki do druku ({equipment.length} szt.)
        </div>
        <button onClick={() => window.print()}
          style={{ background:'#FBB724', color:'#000', border:'none', padding:'10px 18px',
            borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14 }}>
          🖨️ Drukuj
        </button>
      </div>

      <div className="no-print" style={{ maxWidth:800, margin:'0 auto 20px',
        padding:'14px', background:'#FFF8E1', border:'1px solid #FBB724', borderRadius:8,
        color:'#7a5500', fontSize:13 }}>
        💡 <strong>Instrukcja:</strong> Kliknij "Drukuj" → w oknie druku wybierz "Zapisz jako PDF"
        lub drukuj bezpośrednio. Najlepiej na papierze samoprzylepnym A4 (etykiety).
        Po wycięciu i zalaminowaniu trwałe na wiele miesięcy.
      </div>

      <div style={{ maxWidth:800, margin:'0 auto',
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
        {equipment.map(item => (
          <div key={item.id} className="qr-print-item" style={{
            border:'2px solid #ddd', borderRadius:8, padding:'12px 8px',
            textAlign:'center', background:'#fff', breakInside:'avoid'
          }}>
            <div style={{ background:'#fff', padding:'4px', display:'inline-block' }}>
              <QRCodeSVG value={item.code} size={110} level="M" />
            </div>
            <div style={{ fontFamily:'monospace', fontWeight:'bold', fontSize:14,
              marginTop:8, color:'#000' }}>{item.code}</div>
            <div style={{ fontSize:10, color:'#666', marginTop:3,
              maxWidth:140, margin:'3px auto 0', lineHeight:1.3 }}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ROOT APP ─────────────────────────────────────────────────────────────── */
export default function App() {
  const initial = loadState();
  const [equipment, setEquipment] = useState(initial.equipment);
  const [history, setHistory] = useState(initial.history);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [scanMode, setScanMode] = useState(null);

  useEffect(() => {
    saveState({ equipment, history });
  }, [equipment, history]);

  const handleLogin = (user) => { setCurrentUser(user); setView('home'); };
  const handleLogout = () => { setCurrentUser(null); setView('login'); };

  const handleAction = (action) => {
    if (action === 'checkout' || action === 'return') {
      setScanMode(action);
      setView('scan');
    } else {
      setView(action);
    }
  };

  const handleConfirm = ({ mode, cart }) => {
    setEquipment(prev => prev.map(item => {
      if (!cart.find(c => c.id === item.id)) return item;
      return { ...item, location: mode === 'checkout' ? currentUser.id : 'warehouse' };
    }));
    setHistory(prev => [...prev, {
      mode, userId: currentUser.id,
      items: cart.map(c => ({ id:c.id, code:c.code, name:c.name, cat:c.cat })),
      time: now()
    }]);
  };

  const handleReset = () => {
    if (!confirm('Czy na pewno zresetować wszystkie dane testowe?\n\nTo cofnie WSZYSTKIE operacje.')) return;
    setEquipment(INITIAL_EQUIPMENT);
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', color:'#fff', fontFamily:'Barlow,sans-serif' }}>
      <style>{STYLES}</style>

      {view === 'login' && (
        <LoginView
          onLogin={handleLogin}
          onReset={handleReset}
          onPrintCodes={() => setView('print')}
        />
      )}
      {view === 'home' && currentUser && (
        <HomeView user={currentUser} equipment={equipment} history={history}
          onAction={handleAction} onLogout={handleLogout} />
      )}
      {view === 'scan' && currentUser && (
        <ScanView user={currentUser} equipment={equipment} mode={scanMode}
          onConfirm={handleConfirm} onBack={() => setView('home')} />
      )}
      {view === 'catalog' && (
        <CatalogView equipment={equipment} onBack={() => setView('home')} />
      )}
      {view === 'history' && (
        <HistoryView history={history} onBack={() => setView('home')} />
      )}
      {view === 'print' && (
        <PrintCodesView equipment={INITIAL_EQUIPMENT} onBack={() => setView('login')} />
      )}
    </div>
  );
}
