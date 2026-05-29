// src/utils/share.js
// Generisanje lepo formatirane poruke trebovanja i deljenje na
// WhatsApp / Telegram / Viber, plus kopiranje u clipboard.

import { CATEGORY_ORDER } from './categories';

// Kreira čist, pregledan tekst trebovanja.
export function generateOrderText(items, orders, variants, notes) {
  const date = new Date();
  const grouped = items.reduce((acc, item) => {
    if (!orders[item.id]) return acc;
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  // Redosled: prvo poznate kategorije, pa ostale po abecedi.
  const known = CATEGORY_ORDER.filter((c) => grouped[c]);
  const extra = Object.keys(grouped)
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  const ordered = [...known, ...extra];

  let total = 0;
  const lines = [];
  lines.push(`🍷 TREBOVANJE  —  ${date.toLocaleDateString('sr-RS')}`);
  lines.push('');

  ordered.forEach((category) => {
    lines.push(`▪️ ${category}`);
    grouped[category].forEach((item) => {
      total += 1;
      const qty = orders[item.id];
      const variant = variants[item.id] ? ` (${variants[item.id]})` : '';
      lines.push(`   • ${qty} ${item.unit} — ${item.name}${variant}`);
    });
    lines.push('');
  });

  if (notes && notes.trim()) {
    lines.push('📝 Napomena:');
    lines.push(`   ${notes.trim()}`);
    lines.push('');
  }

  lines.push(`Ukupno stavki: ${total}`);
  lines.push(`Kreirano: ${date.toLocaleString('sr-RS')}`);

  return lines.join('\n');
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
