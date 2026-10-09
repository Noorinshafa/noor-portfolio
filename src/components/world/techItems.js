// What flies out of Noor's laptop. Edit freely — `label` is drawn onto a glossy 3D tile.
// Brand logos are deliberately not reproduced; each tool gets a typographic badge in the site palette.

export const TECH = [
  { label: 'React', glyph: '', from: '#DCEBFB', to: '#9DC0EA', ink: '#203A5A', ring: true, featured: true },
  { label: 'Claude', glyph: 'AI', from: '#FBE6DA', to: '#D9B6E6', ink: '#4A2F5E', featured: true },
  { label: 'HTML', glyph: '</>', from: '#F6D3C2', to: '#E9A98F', ink: '#5A2E22' },
  { label: 'CSS', glyph: '{ }', from: '#B4D8DC', to: '#7FB3BC', ink: '#1F4752' },
  { label: 'JS', glyph: '=>', from: '#FFF1BF', to: '#F2D77E', ink: '#4D3F12' },
  { label: 'Vite', glyph: '»', from: '#E5DBFA', to: '#B9AADB', ink: '#3E2F66' },
  { label: 'GitHub', glyph: '@', from: '#E3E6EE', to: '#B8BDCC', ink: '#262B38' },
  { label: 'Git', glyph: '±', from: '#FBE1D9', to: '#F2B4A1', ink: '#5A2A20' },
];

export const SNIPPETS = [
  { code: ['<h1>Hello,', '  world ✿</h1>'], tint: '#F6D3C2' },
  { code: ['.noor {', '  display: flex;', '}'], tint: '#B4D8DC' },
  { code: ['useState(✿)'], tint: '#B9AADB' },
];

/**
 * Draws every tile and snippet card into one texture atlas.
 * Returns { canvas, cells: [{u0,v0,u1,v1, aspect}] } with tech tiles first, then snippets.
 */
export function drawAtlas(scale = 1) {
  const cell = Math.round(320 * scale);
  const cols = 4;
  const rows = 4;
  const cv = document.createElement('canvas');
  cv.width = cell * cols;
  cv.height = cell * rows;
  const ctx = cv.getContext('2d');
  const cells = [];
  const fontSans = '"DM Sans", "Segoe UI", system-ui, sans-serif';
  const fontMono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  const round = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  let i = 0;
  const slot = () => {
    const c = i % cols, r = Math.floor(i / cols);
    i++;
    return [c * cell, r * cell];
  };

  TECH.forEach((t) => {
    const [x, y] = slot();
    const p = cell * 0.04;
    const g = ctx.createLinearGradient(x, y, x + cell, y + cell);
    g.addColorStop(0, t.from);
    g.addColorStop(1, t.to);
    round(x + p, y + p, cell - 2 * p, cell - 2 * p, cell * 0.2);
    ctx.fillStyle = g;
    ctx.fill();
    // glossy highlight
    const hl = ctx.createLinearGradient(x, y, x, y + cell * 0.6);
    hl.addColorStop(0, 'rgba(255,255,255,0.75)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    round(x + p * 2, y + p * 2, cell - 4 * p, cell * 0.45, cell * 0.16);
    ctx.fillStyle = hl;
    ctx.fill();
    ctx.fillStyle = t.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (t.ring) {
      // three soft orbits (a generic atom motif, not a brand mark)
      ctx.save();
      ctx.translate(x + cell / 2, y + cell * 0.42);
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = cell * 0.022;
      for (let k = 0; k < 3; k++) {
        ctx.save();
        ctx.rotate((k * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, cell * 0.25, cell * 0.095, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, cell * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.font = `600 ${cell * 0.3}px ${fontMono}`;
      ctx.fillText(t.glyph, x + cell / 2, y + cell * 0.42);
    }
    ctx.font = `700 ${cell * (t.small ? 0.11 : 0.15)}px ${fontSans}`;
    ctx.fillText(t.label, x + cell / 2, y + cell * 0.77);
    cells.push({ u0: x / cv.width, v0: y / cv.height, u1: (x + cell) / cv.width, v1: (y + cell) / cv.height, aspect: 1 });
  });

  // snippet cards take two cells side by side
  if (i % 2) i++;
  SNIPPETS.forEach((s) => {
    if ((i % cols) + 2 > cols) i += cols - (i % cols);
    const c = i % cols, r = Math.floor(i / cols);
    i += 2;
    const x = c * cell, y = r * cell, w = cell * 2, h = cell;
    const p = cell * 0.05;
    round(x + p, y + p * 2, w - 2 * p, h - 4 * p, cell * 0.12);
    ctx.fillStyle = 'rgba(255,253,249,0.96)';
    ctx.fill();
    ctx.strokeStyle = s.tint;
    ctx.lineWidth = cell * 0.03;
    ctx.stroke();
    // title-bar dots
    ['#F6D3C2', '#B9AADB', '#B4D8DC'].forEach((col, k) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x + p * 2.6 + k * cell * 0.08, y + p * 3.6, cell * 0.025, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const lh = cell * 0.17;
    const top = y + h / 2 - ((s.code.length - 1) * lh) / 2 + cell * 0.04;
    s.code.forEach((line, k) => {
      ctx.font = `600 ${cell * 0.13}px ${fontMono}`;
      ctx.fillStyle = k === 0 ? '#776991' : '#385A69';
      ctx.fillText(line, x + p * 2.6, top + k * lh);
    });
    cells.push({ u0: x / cv.width, v0: y / cv.height, u1: (x + w) / cv.width, v1: (y + h) / cv.height, aspect: 2 });
  });

  return { canvas: cv, cells };
}
