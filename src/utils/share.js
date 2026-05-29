// src/utils/share.js
// Generisanje lepo formatirane poruke trebovanja i deljenje na
// WhatsApp / Telegram / Viber, plus kopiranje u clipboard.
//
// Model: artikli BEZ varijanti imaju količinu u `orders[id]`.
// Artikli SA varijantama imaju količinu po vrsti u `variantOrders[id][varijanta]`,
// pa se svaka vrsta prikazuje kao zasebna linija (npr. 1 Nana, 1 Kamilica...).

import { CATEGORY_ORDER } from './categories';

// Pretvara trebovanje u ravnu listu linija (jedna linija = jedna stavka/vrsta).
export function buildOrderLines(items, orders = {}, variantOrders = {}) {
  const lines = [];
  items.forEach((item) => {
    if (item.variants?.length) {
      const vo = variantOrders[item.id] || {};
      item.variants.forEach((variant) => {
        const qty = vo[variant];
        if (qty > 0) {
          lines.push({
            key: `${item.id}__${variant}`,
            category: item.category,
            name: item.name,
            variant,
            qty,
            unit: item.unit,
          });
        }
      });
    } else if (orders[item.id] > 0) {
      lines.push({
        key: `${item.id}`,
        category: item.category,
        name: item.name,
        variant: null,
        qty: orders[item.id],
        unit: item.unit,
      });
    }
  });
  return lines;
}

// Grupiše linije po kategorijama u pravilnom redosledu.
export function groupLinesByCategory(lines) {
  const grouped = lines.reduce((acc, l) => {
    (acc[l.category] = acc[l.category] || []).push(l);
    return acc;
  }, {});
  const known = CATEGORY_ORDER.filter((c) => grouped[c]);
  const extra = Object.keys(grouped)
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  return [...known, ...extra].map((category) => ({ category, lines: grouped[category] }));
}

// Ukupan broj stavki (linija) u trebovanju.
export function countOrderLines(items, orders, variantOrders) {
  return buildOrderLines(items, orders, variantOrders).length;
}

// Kreira čist, pregledan tekst trebovanja.
export function generateOrderText(items, orders, variantOrders, notes) {
  const date = new Date();
  const groups = groupLinesByCategory(buildOrderLines(items, orders, variantOrders));

  let total = 0;
  const out = [];
  out.push(`🍷 TREBOVANJE  —  ${date.toLocaleDateString('sr-RS')}`);
  out.push('');

  groups.forEach(({ category, lines }) => {
    out.push(`▪️ ${category}`);
    lines.forEach((l) => {
      total += 1;
      const variant = l.variant ? ` (${l.variant})` : '';
      out.push(`   • ${l.qty} ${l.unit} — ${l.name}${variant}`);
    });
    out.push('');
  });

  if (notes && notes.trim()) {
    out.push('📝 Napomena:');
    out.push(`   ${notes.trim()}`);
    out.push('');
  }

  out.push(`Ukupno stavki: ${total}`);
  out.push(`Kreirano: ${date.toLocaleString('sr-RS')}`);

  return out.join('\n');
}

// Kopiranje u clipboard sa fallback-om za starije/nesigurne kontekste.
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // padamo na fallback ispod
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function shareWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareTelegram(text) {
  // Telegram share zahteva url param; tekst stavljamo u text.
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(text)}`,
    '_blank'
  );
}

export function shareViber(text) {
  // Viber forward radi preko viber:// šeme (mobilni uređaji).
  window.location.href = `viber://forward?text=${encodeURIComponent(text)}`;
}

// Native Web Share API (npr. deli direktno ka bilo kojoj aplikaciji na telefonu).
export async function shareNative(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Trebovanje', text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function canShareNative() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// Bezbedno escape-ovanje za HTML.
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPrintHTML(items, orders, variantOrders, notes) {
  const date = new Date();
  const groups = groupLinesByCategory(buildOrderLines(items, orders, variantOrders));
  let total = 0;

  const sections = groups
    .map(({ category, lines }) => {
      const rows = lines
        .map((l) => {
          total += 1;
          const variant = l.variant ? ` <span class="v">(${esc(l.variant)})</span>` : '';
          return `<tr><td class="q">${l.qty} ${esc(l.unit)}</td><td>${esc(l.name)}${variant}</td></tr>`;
        })
        .join('');
      return `<h2>${esc(category)}</h2><table>${rows}</table>`;
    })
    .join('');

  const notesBlock =
    notes && notes.trim()
      ? `<div class="notes"><strong>Napomena:</strong><br>${esc(notes.trim()).replace(/\n/g, '<br>')}</div>`
      : '';

  return `<!doctype html><html lang="sr"><head><meta charset="utf-8">
<title>Trebovanje ${date.toLocaleDateString('sr-RS')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, Arial, sans-serif; color: #0f172a; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .date { color: #64748b; font-size: 13px; margin-bottom: 16px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #0369a1;
       border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  td.q { width: 90px; font-weight: 700; white-space: nowrap; }
  .v { color: #64748b; font-weight: 400; }
  .notes { margin-top: 18px; padding: 10px 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
  .total { margin-top: 18px; font-weight: 700; }
  @media print { body { margin: 12mm; } }
</style></head>
<body>
  <h1>🍷 Trebovanje pića</h1>
  <div class="date">${date.toLocaleString('sr-RS')}</div>
  ${sections || '<p>Nema stavki.</p>'}
  ${notesBlock}
  <div class="total">Ukupno stavki: ${total}</div>
</body></html>`;
}

// Otvara štampu (može da se sačuva kao PDF) preko skrivenog iframe-a.
export function printOrder(items, orders, variantOrders, notes) {
  const html = buildPrintHTML(items, orders, variantOrders, notes);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => iframe.parentNode && document.body.removeChild(iframe), 1000);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      /* ignore */
    }
    cleanup();
  };
}
