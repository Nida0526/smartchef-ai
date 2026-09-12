const INLINE_RE = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))/g;

export function parseInline(text) {
  const tokens = [];
  let lastIndex = 0;
  let match;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      tokens.push({ type: 'bold', content: match[1].slice(2, -2) });
    } else if (match[2]) {
      tokens.push({ type: 'italic', content: match[2].slice(1, -1) });
    } else if (match[3]) {
      tokens.push({ type: 'code', content: match[3].slice(1, -1) });
    } else if (match[4]) {
      const inner = match[4];
      const close = inner.lastIndexOf('](');
      tokens.push({
        type: 'link',
        text: inner.slice(1, close),
        url: inner.slice(close + 2, -1)
      });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return tokens.length ? tokens : [{ type: 'text', content: text }];
}

const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const BULLET_RE = /^[-*]\s+(.*)$/;
const NUMBERED_RE = /^\d+\.\s+(.*)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;

export function splitBlocks(text) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', content: paragraph.join(' ') });
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      flushParagraph();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', content: codeLines.join('\n') });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      i += 1;
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      flushParagraph();
      blocks.push({ type: 'heading', level: heading[1].length, content: heading[2] });
      i += 1;
      continue;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      flushParagraph();
      blocks.push({ type: 'bullet', content: bullet[1] });
      i += 1;
      continue;
    }

    const numbered = line.match(NUMBERED_RE);
    if (numbered) {
      flushParagraph();
      blocks.push({ type: 'numbered', content: numbered[1] });
      i += 1;
      continue;
    }

    const quote = line.match(BLOCKQUOTE_RE);
    if (quote) {
      flushParagraph();
      blocks.push({ type: 'quote', content: quote[1] });
      i += 1;
      continue;
    }

    if (/^-{3,}$/.test(line.trim())) {
      flushParagraph();
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }

  flushParagraph();
  return blocks;
}