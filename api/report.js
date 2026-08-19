// Studio Inventory — codzienny raport aktywności (Vercel Serverless Function)
//
// Ten plik NIE jest częścią interfejsu aplikacji — fotografowie go nie widzą i nie używa
// go żaden przycisk w App.jsx. To osobny, "cichy" adres, pod którym Claude (asystent AI)
// codziennie rano pobiera podsumowanie aktywności z poprzedniego dnia i przygotowuje raport.
//
// Działa, bo Vercel uruchamia pliki z folderu /api jako małe funkcje serwerowe — w
// odróżnieniu od zwykłego kodu aplikacji (który działa w przeglądarce fotografa), ten kod
// wykonuje się na serwerach Vercela, które mają pełny dostęp do internetu (m.in. do bazy
// Supabase) — stąd może pobrać dane bez udziału jakiegokolwiek fotografa.
//
// Adres po wdrożeniu: https://project-5ab4t.vercel.app/api/report?date=2026-08-19&key=raport2026
//   - "date" (opcjonalne, format RRRR-MM-DD) — dla którego dnia raport. Bez tego parametru:
//     wczorajszy dzień.
//   - "key" (wymagane) — proste zabezpieczenie, żeby przypadkowa osoba ze znajomym adresem
//     nie mogła "z ciekawości" pobrać danych. To nie jest silne hasło (to samo podejście co
//     reszta aplikacji — hasła w plain-tekście), tylko odstraszacz.

const SUPABASE_URL = 'https://luqsaqktiglquspuxrxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cXNhcWt0aWdscXVzcHV4cnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTQ5MzYsImV4cCI6MjA5NzY5MDkzNn0.WxE4wVBKlLMNrcGd6989_Vi0TQmGgEc-Ayz9m4ytmIQ';
const REPORT_KEY = 'raport2026'; // zmień na własne, jeśli chcesz — wystarczy edytować tę linijkę

async function sb(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!r.ok) throw new Error(`Supabase ${path} -> HTTP ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  try {
    if ((req.query.key || '') !== REPORT_KEY) {
      return res.status(403).json({ error: 'Brak lub nieprawidłowy parametr "key".' });
    }

    // Domyślnie: wczorajszy dzień (raport generowany rano, o wydarzeniach z dnia poprzedniego).
    let target;
    if (req.query.date) {
      const [y, m, d] = req.query.date.split('-').map(Number);
      target = new Date(y, m - 1, d);
    } else {
      target = new Date();
      target.setDate(target.getDate() - 1);
    }
    const targetDay = target.getDate();
    const targetMonth = target.getMonth() + 1;
    const targetYear = target.getFullYear();
    const dateLabel = `${String(targetDay).padStart(2, '0')}.${String(targetMonth).padStart(2, '0')}.${targetYear}`;

    const [historyAll, feedbackAll, equipment, users] = await Promise.all([
      sb('history?select=*'),
      sb('feedback?select=*'),
      sb('equipment?select=*'),
      sb('users?select=*'),
    ]);

    const userName = (id) => (users.find((u) => u.id === id) || {}).name || id;

    // Pole "time" w historii to tekst w formacie "D.M.RRRR GG:MM" (polski format daty), nie
    // znacznik czasu ISO — dlatego dopasowujemy dzień/miesiąc/rok ręcznie, zamiast filtrować
    // to w zapytaniu SQL.
    const dayHistory = historyAll.filter((h) => {
      const datePart = (h.time || '').split(' ')[0];
      const [d, m, y] = datePart.split('.').map(Number);
      return d === targetDay && m === targetMonth && y === targetYear;
    });

    const checkouts = dayHistory.filter((h) => h.mode === 'checkout');
    const returns = dayHistory.filter((h) => h.mode === 'return');

    const activeUserIds = [...new Set(dayHistory.map((h) => h.user_id))];
    const activeUsers = activeUserIds.map((id) => ({
      name: userName(id),
      checkouts: checkouts.filter((h) => h.user_id === id).length,
      returns: returns.filter((h) => h.user_id === id).length,
    }));

    const operations = dayHistory
      .sort((a, b) => (a.time > b.time ? 1 : -1))
      .map((h) => ({
        time: h.time,
        user: userName(h.user_id),
        mode: h.mode,
        items: (h.items || []).map((i) => `${i.code} ${i.name}`),
      }));

    // Zgłoszenia (feedback) — created_at jest prawdziwym znacznikiem czasu (ISO), więc
    // filtrujemy go po prostu przez datę kalendarzową w strefie Europe/Warsaw.
    const newFeedback = feedbackAll
      .filter((f) => {
        const d = new Date(f.created_at);
        const local = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
        return local.getDate() === targetDay && local.getMonth() + 1 === targetMonth && local.getFullYear() === targetYear;
      })
      .map((f) => ({ user: f.user_name, category: f.category, description: f.description, status: f.status }));

    const assignedEquipment = equipment
      .filter((e) => e.assigned_to)
      .map((e) => ({ code: e.code, name: e.name, cat: e.cat, assignedTo: userName(e.assigned_to) }));

    const inWarehouse = equipment.filter((e) => e.location === 'warehouse' && !e.assigned_to).length;
    const withPhotographers = equipment.filter((e) => e.location !== 'warehouse' && !e.assigned_to).length;

    res.status(200).json({
      date: dateLabel,
      checkoutsCount: checkouts.length,
      returnsCount: returns.length,
      activeUsers,
      operations,
      newFeedback,
      assignedEquipment,
      totals: {
        totalEquipment: equipment.length,
        inWarehouse,
        withPhotographers,
        assignedPermanently: assignedEquipment.length,
      },
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}