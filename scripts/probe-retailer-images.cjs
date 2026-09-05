'use strict';

const TIMEOUT_MS = 15000;
const ORIGIN = 'https://allyssonestadulho92.github.io';
const SAMPLES = [
  {
    store: 'continente',
    pid: '6927230',
    url: 'https://www.continente.pt/produto/arroz-agulha-continente-continente-6927230.html'
  },
  {
    store: 'pingodoce',
    pid: '48150',
    url: 'https://www.pingodoce.pt/home/produtos/leite-e-bebidas-vegetais/leite/leite-meio-gordo-e-gordo%E2%80%8B/leite-uht-meio-gordo-pingo-doce-48150.html'
  }
];

function decodeHtml(value='') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function absoluteUrl(value, base) {
  if (!value) return '';
  try { return new URL(decodeHtml(value), base).href; }
  catch (_error) { return ''; }
}

function extractImageCandidates(html, base) {
  const found = [];
  const push = (kind, raw) => {
    const url = absoluteUrl(raw, base);
    if (!url || !/^https:/.test(url)) return;
    if (!/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(url) && !/\/dw\/image\//i.test(url)) return;
    if (!found.some(item => item.url === url)) found.push({ kind, url });
  };

  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) push('meta', match[1]);
  for (const match of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/gi)) push('meta', match[1]);
  for (const match of html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi)) push('img', match[1]);
  for (const match of html.matchAll(/(?:image|imageUrl|imageURL|largeImage|mediumImage|smallImage)["']?\s*[:=]\s*["']([^"']+)["']/gi)) push('json', match[1]);

  return found;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ContaDeCasa-RetailerImageAudit/1.0',
      Origin: ORIGIN,
      Accept: 'text/html,application/xhtml+xml'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  return { response, text: await response.text() };
}

async function probeImage(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ContaDeCasa-RetailerImageAudit/1.0',
        Origin: ORIGIN,
        Range: 'bytes=0-64'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    return {
      status: response.status,
      type: response.headers.get('content-type'),
      acao: response.headers.get('access-control-allow-origin'),
      finalUrl: response.url
    };
  } catch (error) {
    return { error: `${error?.name || 'Error'}: ${error?.message || error}` };
  }
}

(async () => {
  for (const sample of SAMPLES) {
    console.log(`\n=== official retailer image probe: ${sample.store} ${sample.pid} ===`);
    try {
      const { response, text } = await fetchText(sample.url);
      console.log('page status:', response.status);
      console.log('page final url:', response.url);
      console.log('page acao:', response.headers.get('access-control-allow-origin'));
      const candidates = extractImageCandidates(text, response.url).slice(0, 20);
      console.log('image candidates:', JSON.stringify(candidates, null, 2));
      for (const candidate of candidates.slice(0, 5)) {
        console.log('image probe:', candidate.kind, JSON.stringify(await probeImage(candidate.url)));
      }
    } catch (error) {
      console.log('ERROR:', error?.name, error?.message);
    }
  }
})();
