export function extractSteps(text) {
  if (!text) return [];

  const lines = String(text)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const instructionIdx = lines.findIndex(l => /^(\*\*)?\s*instructions/i.test(l));
  const start = instructionIdx === -1 ? 0 : instructionIdx + 1;

  const steps = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]
      .replace(/^#{1,3}\s*/, '')
      .replace(/^(\d+)[.)]\s*/, '')
      .replace(/^[-*]\s*/, '')
      .replace(/\*\*/g, '')
      .trim();
    if (!line) continue;
    if (/^(\*\*)?\s*(ingredients|notes|tips?):?/i.test(line)) continue;
    steps.push(line);
  }

  return steps;
}

const DURATION_RE = /(\d+)\s*(hour|hr|h|min|minute|sec|second|s)\b/i;

export function parseDuration(text) {
  const m = String(text).match(DURATION_RE);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase()[0];
  if (unit === 's') return n;
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 3600;
  return null;
}

export function formatDuration(seconds) {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s ? `${m}m ${s}s` : `${m}m`;
  }
  return `${seconds}s`;
}