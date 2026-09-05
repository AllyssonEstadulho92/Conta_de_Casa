'use strict';

const ORIGIN = 'https://allyssonestadulho92.github.io';

async function probe(name, url, init = {}) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      ...init,
      headers: {
        Origin: ORIGIN,
        'User-Agent': 'ContaDeCasa-MarketSourceAudit/1.0',
        ...(init.headers || {})
      }
    });
    const text = await response.text();
    console.log(`\n=== ${name} ===`);
    console.log('url:', response.url);
    console.log('status:', response.status);
    console.log('content-type:', response.headers.get('content-type'));
    console.log('access-control-allow-origin:', response.headers.get('access-control-allow-origin'));
    console.log('access-control-allow-methods:', response.headers.get('access-control-allow-methods'));
    console.log('access-control-allow-headers:', response.headers.get('access-control-allow-headers'));
    console.log('body:', text.slice(0, 1200).replace(/\s+/g, ' '));
  } catch (error) {
    console.log(`\n=== ${name} ===`);
    console.log('ERROR:', error?.stack || error);
  }
}

(async () => {
  await probe('cesta MCP preflight', 'https://cesta.pt/mcp', {
    method: 'OPTIONS',
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,mcp-protocol-version'
    }
  });

  await probe('cesta MCP initialize', 'https://cesta.pt/mcp', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'Conta de Casa source audit', version: '1.0.0' }
      }
    })
  });

  await probe('O Preço Certo consumer search', 'https://oprecocerto.pt/p/pesquisa?q=leite&per_page=30');
  await probe('Continente category', 'https://www.continente.pt/laticinios-e-ovos/leite/meio-gordo/');
  await probe('Pingo Doce search page', 'https://www.pingodoce.pt/?s=leite');
})();
