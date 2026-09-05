'use strict';

const BASE='https://prices.openfoodfacts.org/api/v1';
const ORIGIN='https://allyssonestadulho92.github.io';
const opts={headers:{Origin:ORIGIN,'User-Agent':'ContaDeCasa-MarketSourceAudit/1.0'},signal:AbortSignal.timeout(12000)};

async function get(path){
  const response=await fetch(`${BASE}${path}`,opts);
  const text=await response.text();
  console.log('\nGET',path,'status',response.status,'acao',response.headers.get('access-control-allow-origin'),'type',response.headers.get('content-type'));
  console.log(text.slice(0,8000));
  try{return JSON.parse(text);}catch{return null;}
}

async function preflight(path){
  const response=await fetch(`${BASE}${path}`,{method:'OPTIONS',headers:{Origin:ORIGIN,'Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'content-type'},signal:AbortSignal.timeout(12000)});
  console.log('\nOPTIONS',path,'status',response.status,'acao',response.headers.get('access-control-allow-origin'),'methods',response.headers.get('access-control-allow-methods'),'headers',response.headers.get('access-control-allow-headers'));
}

(async()=>{
  await preflight('/products?product_name__like=leite&price_count__gte=1&size=10');
  const locations=await get('/locations?osm_name__like=Mercadona&osm_address_country__like=Portugal&price_count__gte=1&size=100');
  const mercadonaIds=(locations?.items||[]).map(x=>x.id).filter(Number.isFinite);
  console.log('mercadona Portugal location ids',mercadonaIds);

  const products=await get('/products?product_name__like=leite&price_count__gte=1&size=50');
  const productIds=(products?.items||[]).map(x=>x.id).filter(Number.isFinite);
  console.log('leite product ids',productIds.slice(0,50));

  if(mercadonaIds.length&&productIds.length){
    const qs=new URLSearchParams({
      location_id__in:mercadonaIds.join(','),
      product_id__in:productIds.join(','),
      currency:'EUR',
      order_by:'-date',
      size:'100'
    });
    await get(`/prices?${qs}`);
  }

  await get('/prices?location__osm_name__contains=Mercadona&currency=EUR&order_by=-date&size=20');
})();
