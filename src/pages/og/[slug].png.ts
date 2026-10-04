import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';

export async function getStaticPaths() {
  const entries = await getCollection('projects');
  return entries.map((e) => ({ params: { slug: e.id }, props: { title: e.data.title, outcome: e.data.outcome, award: e.data.award } }));
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text: string, max: number, maxLines: number) {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[ ,.;:]*\S*$/, '') + '...';
  }
  return lines;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, outcome, award } = props as { title: string; outcome: string; award?: { rank: string; event: string } };
  const lines = wrap(outcome, 56, 4);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0E1411"/>
  <rect x="80" y="80" width="8" height="470" fill="#5CC497"/>
  ${award ? `<text x="120" y="130" font-family="monospace" font-size="28" fill="#E8956A">${esc(award.rank)} · ${esc(award.event)}</text>` : ''}
  <text x="120" y="240" font-family="sans-serif" font-size="92" font-weight="700" fill="#E8EDE9">${esc(title)}</text>
  ${lines.map((l, i) => `<text x="120" y="${320 + i * 46}" font-family="sans-serif" font-size="34" fill="#A3ADA6">${esc(l)}</text>`).join('\n  ')}
  <text x="120" y="560" font-family="monospace" font-size="26" fill="#5CC497">Athul VR · athul-vr.vercel.app</text>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
