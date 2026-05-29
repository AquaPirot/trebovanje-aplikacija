// src/utils/categories.js
// Metapodaci kategorija: redosled, ikona i jedna akcentna boja po kategoriji.
// Koristimo pune Tailwind klase (ne dinamičke) da bi ih JIT pokupio.

import { Coffee, Wine, Beer, GlassWater } from 'lucide-react';

export const CATEGORY_ORDER = [
  'TOPLI NAPICI',
  'BEZALKOHOLNA PIĆA',
  'CEDEVITA I ENERGETSKA PIĆA',
  'NEXT SOKOVI',
  'PIVA',
  'SOMERSBY',
  'ŽESTOKA PIĆA',
  'VISKI',
  'BRENDI I KONJACI',
  'LIKERI',
  'DOMAĆA ALKOHOLNA PIĆA',
  'BELA VINA',
  'CRVENA VINA',
  'ROZE VINA',
  'VINA 0,187L',
  'BAZEN',
];

// Paleta hue-ova sa kompletnim klasama (light + dark).
const HUES = {
  amber:   { text: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500',   tint: 'bg-amber-50 dark:bg-amber-500/10' },
  sky:     { text: 'text-sky-600 dark:text-sky-400',       dot: 'bg-sky-500',     tint: 'bg-sky-50 dark:bg-sky-500/10' },
  lime:    { text: 'text-lime-600 dark:text-lime-400',     dot: 'bg-lime-500',    tint: 'bg-lime-50 dark:bg-lime-500/10' },
  violet:  { text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500',  tint: 'bg-violet-50 dark:bg-violet-500/10' },
  yellow:  { text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500',  tint: 'bg-yellow-50 dark:bg-yellow-500/10' },
  pink:    { text: 'text-pink-600 dark:text-pink-400',     dot: 'bg-pink-500',    tint: 'bg-pink-50 dark:bg-pink-500/10' },
  red:     { text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500',     tint: 'bg-red-50 dark:bg-red-500/10' },
  orange:  { text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500',  tint: 'bg-orange-50 dark:bg-orange-500/10' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', tint: 'bg-emerald-50 dark:bg-emerald-500/10' },
  rose:    { text: 'text-rose-600 dark:text-rose-400',     dot: 'bg-rose-500',    tint: 'bg-rose-50 dark:bg-rose-500/10' },
  indigo:  { text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500',  tint: 'bg-indigo-50 dark:bg-indigo-500/10' },
  teal:    { text: 'text-teal-600 dark:text-teal-400',     dot: 'bg-teal-500',    tint: 'bg-teal-50 dark:bg-teal-500/10' },
  slate:   { text: 'text-slate-600 dark:text-slate-300',   dot: 'bg-slate-500',   tint: 'bg-slate-100 dark:bg-slate-700/30' },
};

const CONFIG = {
  'TOPLI NAPICI':               { icon: Coffee,     hue: 'amber' },
  'BEZALKOHOLNA PIĆA':          { icon: GlassWater, hue: 'sky' },
  'CEDEVITA I ENERGETSKA PIĆA': { icon: GlassWater, hue: 'lime' },
  'NEXT SOKOVI':                { icon: GlassWater, hue: 'orange' },
  'PIVA':                       { icon: Beer,       hue: 'yellow' },
  'SOMERSBY':                   { icon: Beer,       hue: 'pink' },
  'ŽESTOKA PIĆA':               { icon: GlassWater, hue: 'red' },
  'VISKI':                      { icon: GlassWater, hue: 'orange' },
  'BRENDI I KONJACI':           { icon: GlassWater, hue: 'amber' },
  'LIKERI':                     { icon: GlassWater, hue: 'violet' },
  'DOMAĆA ALKOHOLNA PIĆA':      { icon: GlassWater, hue: 'slate' },
  'BELA VINA':                  { icon: Wine,       hue: 'emerald' },
  'CRVENA VINA':                { icon: Wine,       hue: 'rose' },
  'ROZE VINA':                  { icon: Wine,       hue: 'pink' },
  'VINA 0,187L':                { icon: Wine,       hue: 'indigo' },
  'BAZEN':                      { icon: GlassWater, hue: 'teal' },
};

const DEFAULT = { icon: GlassWater, hue: 'slate' };

export function getCategoryMeta(category) {
  const conf = CONFIG[category] || DEFAULT;
  const hue = HUES[conf.hue] || HUES.slate;
  return { Icon: conf.icon, ...hue };
}
