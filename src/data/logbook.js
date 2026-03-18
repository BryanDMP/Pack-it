// ─────────────────────────────────────────────
//  PACK-IT  –  Logbook (DNS cache)
//  Persists across scenes via a module-level object.
// ─────────────────────────────────────────────

const _logbook = {};

export function logbookAdd(domain, ip) {
  _logbook[domain] = ip;
}

export function logbookGet(domain) {
  return _logbook[domain] ?? null;
}

export function logbookHas(domain) {
  return domain in _logbook;
}

export function logbookEntries() {
  return Object.entries(_logbook);
}

export function logbookClear() {
  for (const k in _logbook) delete _logbook[k];
}

export function logbookSummary() {
  const entries = logbookEntries();
  if (entries.length === 0) return "📖 Logbook: vide";
  return "📖 " + entries.map(([d, ip]) => `${d} → ${ip}`).join("  |  ");
}
