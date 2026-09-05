'use strict';

const ORIGIN = 'https://allyssonestadulho92.github.io';
const TIMEOUT_MS = 12000;

function headers(extra = {}) {
  return {
    Origin: ORIGIN,
    'User-Agent': 'ContaDeCasa-MarketSourceAudit/1.0',
    ...extra
  };
}

function parseSse(text) {
  const events = [];
  for (const block of String(text || '').split(/\n\n+/)) {
    const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
    if (!data) continue;
    try { events.push(JSON.parse(data)); } catch (_error) { events.push({ raw: data }); }
  }
  return events;
}

async function request(url, init = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...init,
    headers: headers(init.headers || {})
  });
  const text = await response.text();
  return { response, text, events: parseSse(text) };
}

async function probe(name, url, init = {}) {
  try {
    const { response, text } = await request(url, init);
    console.log(`\n=== ${name} ===`);
    console.log('url:', response.url);
    console.log('status:', response.status);
    console.log('content-type:', response.headers.get('content-type'));
    console.log('access-control-allow-origin:', response.headers.get('access-control-allow-origin'));
    console.log('access-control-allow-methods:', response.headers.get('access-control-allow-methods'));
    console.log('access-control-allow-headers:', response.headers.get('access-control-allow-headers'));
    console.log('mcp-session-id:', response.headers.get('mcp-session-id'));
    console.log('body:', text.slice(0, 1600).replace(/\s+/g, ' '));
    return { response, text };
  } catch (error) {
    console.log(`\n=== ${name} ===`);
    console.log('ERROR:', error?.name, error?.message);
    return null;
  }
}

async function probeCestaMcp() {
  await probe('cesta MCP preflight', 'https://cesta.pt/mcp', {
    method: 'OPTIONS',
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,mcp-protocol-version'
    }
  });

  const init = await request('https://cesta.pt/mcp', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18'
    },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'Conta de Casa source audit', version: '1.0.0' }
      }
    })
  });
  const session = init.response.headers.get('mcp-session-id');
  console.log('\n=== cesta MCP initialize ===');
  console.log('status:', init.response.status, 'session:', session || '(stateless)', 'acao:', init.response.headers.get('access-control-allow-origin'));
  console.log('events:', JSON.stringify(init.events).slice(0, 2500));

  const commonHeaders = {
    Accept: 'application/json, text/event-stream',
    'Content-Type': 'application/json',
    'MCP-Protocol-Version': '2025-06-18',
    ...(session ? { 'Mcp-Session-Id': session } : {})
  };

  await request('https://cesta.pt/mcp', {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })
  }).catch(() => null);

  const listed = await request('https://cesta.pt/mcp', {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
  });
  console.log('\n=== cesta MCP tools/list ===');
  console.log('status:', listed.response.status, 'acao:', listed.response.headers.get('access-control-allow-origin'));
  console.log('events:', JSON.stringify(listed.events, null, 2).slice(0, 10000));

  const payload = listed.events.find(event => event?.result?.tools)?.result;
  const tools = payload?.tools || [];
  const searchTool = tools.find(tool => /search|price|product|compare/i.test(tool.name));
  if (!searchTool) return;

  console.log('\n=== cesta candidate search tool ===');
  console.log(JSON.stringify(searchTool, null, 2));

  const schema = searchTool.inputSchema || {};
  const args = {};
  const properties = schema.properties || {};
  if (properties.query) args.query = 'leite meio gordo';
  else if (properties.term) args.term = 'leite meio gordo';
  else if (properties.search) args.search = 'leite meio gordo';
  else if (properties.product) args.product = 'leite meio gordo';
  if (properties.limit) args.limit = 5;

  const required = schema.required || [];
  if (required.some(key => !(key in args))) {
    console.log('Skipping tool call; unresolved required args:', required.filter(key => !(key in args)));
    return;
  }

  const called = await request('https://cesta.pt/mcp', {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: searchTool.name, arguments: args }
    })
  });
  console.log('\n=== cesta sample live search ===');
  console.log('tool:', searchTool.name, 'args:', JSON.stringify(args), 'status:', called.response.status);
  console.log('events:', JSON.stringify(called.events, null, 2).slice(0, 12000));
}

async function inspectPage(name, url) {
  const result = await probe(name, url);
  if (!result) return;
  const urls = [...new Set((result.text.match(/https?:\\?\/\\?\/[^"'<>\\s)]+/g) || []).map(value => value.replace(/\\\//g, '/')))];
  const apiHints = [...new Set((result.text.match(/(?:https?:\\?\/\\?\/[^"'<>\\s)]+|\/api\/[^"'<>\\s)]+|api\.[a-z0-9.-]+[^"'<>\\s)]*)/gi) || []).map(value => value.replace(/\\\//g, '/')))];
  console.log(`\n=== ${name} endpoint hints ===`);
  console.log(JSON.stringify(apiHints.slice(0, 80), null, 2));
  console.log('absolute URL sample:', JSON.stringify(urls.slice(0, 20), null, 2));
}

(async () => {
  await probeCestaMcp();
  await inspectPage('O Preço Certo consumer search', 'https://oprecocerto.pt/p/pesquisa?q=leite&per_page=30');
  await inspectPage('Super Save home', 'https://supersave.pt/');
  await probe('Continente category', 'https://www.continente.pt/laticinios-e-ovos/leite/meio-gordo/');
  await probe('Pingo Doce search page', 'https://www.pingodoce.pt/?s=leite');
})();
