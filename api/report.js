// Studio Inventory — codzienny raport aktywności (Vercel Serverless Function)
//
// Ten plik NIE jest częścią interfejsu aplikacji — fotografowie go nie widzą i nie używa
// go żaden przycisk w App.jsx. Wykonuje się na serwerach Vercela (pełny dostęp do internetu,
// m.in. do bazy Supabase), niezależnie od tego czy ktokolwiek ma otwartą aplikację.
//
// AKTUALIZACJA (wrzesień 2026): wcześniej ten adres pobierał (przez WebFetch) codziennie
// rano Claude, który układał z danych tekstowe podsumowanie po polsku i wysyłał je jako
// powiadomienie push do Product Ownera. Zrezygnowano z tego — jest za mało niezawodne
// (powiadomienie czasem nie dociera / sesja Claude czasem nie ma jak "kliknąć zgody" na
// pobranie strony) i widoczne tylko dla jednej osoby. Teraz ten sam endpoint, wywoływany
// automatycznie raz dziennie przez Vercel Cron (patrz vercel.json w repo głównym), zapisuje
// wynik raportu bezpośrednio do tabeli Supabase "daily_reports" — a każdy administrator
// widzi go w aplikacji, w Panelu Admina → zakładka "📅 Raport", bez żadnych powiadomień.
// SQL do utworzenia tabel: utworz_tabele_raporty_dzienne.sql (w tym Project).
//
// Adres: https://project-5ab4t.vercel.app/api/report?date=2026-09-07&key=raport2026
//   - "date" (opcjonalne, format RRRR-MM-DD) — dla którego dnia raport. Bez tego parametru:
//     wczorajszy dzień.
//   - "key" (wymagane) — proste zabezpieczenie, żeby przypadkowa osoba ze znajomym adresem
//     nie mogła "z ciekawości" pobrać/nadpisać danych. To nie jest silne hasło (to samo
//     podejście co reszta aplikacji — hasła w plain-tekście), tylko odstraszacz.
//
// Wywołanie tego adresu jest bezpieczne do powtarzania: dla tego samego dnia NADPISUJE
// poprzedni wpis w "daily_reports" (upsert po report_date), więc ręczne odświeżenie w
// przeglądarce w celach testowych nie tworzy duplikatów.

const SUPABASE_URL = 'https://luqsaqktiglquspuxrxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cXNhcWt0aWdscXVzcHV4cnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTQ5MzYsImV4cCI6MjA5NzY5MDkzNn0.WxE4wVBKlLMNrcGd6989_Vi0TQmGgEc-Ayz9m4ytmIQ';
const REPORT_KEY = 'raport2026'; // zmień na własne, jeśli chcesz — wystarczy edytować tę linijkę

async function sb(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!r.ok) throw new Error(`Supabase GET ${path} -> HTTP ${r.status}`);
  return r.json();
}

// Upsert po jednej kolumnie (np. report_date) — "Prefer: resolution=merge-duplicates"
// każe Supabase nadpisać istniejący wiersz zamiast zwracać błąd konfliktu.
async function sbUpsert(path, body, conflictColumn) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}?on_conflict=${conflictColumn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase UPSERT ${path} -> HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

// Pole "time" w tabeli "history" to tekst w formacie "D.M.RRRR GG:MM" (polski format daty),
// nie znacznik czasu ISO — ta funkcja zamienia go na obiekt Date, żeby móc porównywać kolejność.
function parsePlDateTime(str) {
  const [datePart, timePart = '0:0'] = String(str || '').split(' ');
  const [d, m, y] = datePart.split('.').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0);
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
    const isoDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

    const [historyAll, feedbackAll, equipment, users] = await Promise.all([
      sb('history?select=*'),
      sb('feedback?select=*'),
      sb('equipment?select=*'),
      sb('users?select=*'),
    ]);

    const userName = (id) => (users.find((u) => u.id === id) || {}).name || id;

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

    // Dla każdej sztuki sprzętu pobranej danego dnia: szukamy w CAŁEJ historii (nie tylko
    // z tego dnia) najwcześniejszego, późniejszego zwrotu tej samej sztuki przez tę samą
    // osobę. Jeśli taki zwrot istnieje — sprzęt uznajemy za zwrócony (z godziną zwrotu).
    // Jeśli nie — sprzęt nadal jest na stanie tej osoby.
    const checkoutItems = checkouts.flatMap((h) => {
      const checkoutTime = parsePlDateTime(h.time);
      return (h.items || []).map((it) => {
        const laterReturns = historyAll
          .filter(
            (r) =>
              r.mode === 'return' &&
              r.user_id === h.user_id &&
              (r.items || []).some((ri) => ri.code === it.code) &&
              parsePlDateTime(r.time) > checkoutTime
          )
          .sort((a, b) => parsePlDateTime(a.time) - parsePlDateTime(b.time));
        const matched = laterReturns[0];
        return {
          code: it.code,
          name: it.name,
          cat: it.cat,
          user: userName(h.user_id),
          checkoutTime: h.time,
          status: matched ? 'returned' : 'outstanding',
          returnTime: matched ? matched.time : null,
        };
      });
    });

    // Zwroty, które fizycznie miały miejsce tego dnia (niezależnie od tego, kiedy dany
    // sprzęt został pobrany — mógł zostać pobrany również wcześniej, nie koniecznie tego dnia).
    const returnEvents = returns.flatMap((h) =>
      (h.items || []).map((it) => ({ code: it.code, name: it.name, cat: it.cat, user: userName(h.user_id), time: h.time }))
    );

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

    const totals = {
      totalEquipment: equipment.length,
      inWarehouse,
      withPhotographers,
      assignedPermanently: assignedEquipment.length,
    };

    const payload = {
      date: dateLabel,
      checkoutsCount: checkouts.length,
      returnsCount: returns.length,
      activeUsers,
      checkoutItems,
      returnEvents,
      newFeedback,
      assignedEquipment,
      totals,
    };

    // Zapis do Supabase, tabela "daily_reports" — patrz utworz_tabele_raporty_dzienne.sql.
    // Jeśli tabela jeszcze nie istnieje, nie blokujemy odpowiedzi JSON (przydatne przy
    // pierwszym teście adresu, zanim SQL zostanie uruchomiony) — tylko dopisujemy ostrzeżenie.
    try {
      await sbUpsert(
        'daily_reports',
        {
          report_date: isoDate,
          checkouts_count: checkouts.length,
          returns_count: returns.length,
          checkout_items: checkoutItems,
          return_events: returnEvents,
          new_feedback: newFeedback,
          assigned_equipment: assignedEquipment,
          totals,
        },
        'report_date'
      );
    } catch (saveErr) {
      console.error('Nie udało się zapisać raportu do Supabase:', saveErr);
      payload.saveWarning = String(saveErr);
    }

    res.status(200).json(payload);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}