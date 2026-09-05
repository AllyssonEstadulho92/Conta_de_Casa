const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function quantityMilli(value='1'){
  const raw=String(value??'').trim().replace(',','.');
  if(!/^\d{1,5}(?:\.\d{1,3})?$/.test(raw))return 1000;
  const [whole,fraction='']=raw.split('.');
  return Number(whole)*1000+Number((fraction+'000').slice(0,3));
}
function lineCents(unitCents,quantity='1'){return Math.round(unitCents*quantityMilli(quantity)/1000);}
const context = vm.createContext({
  marketLineCents:lineCents,
  sumCents(values){
    let total=0;
    for(const value of values){
      assert.equal(Number.isSafeInteger(value),true,'money values must remain safe integers');
      total+=value;
      assert.equal(Number.isSafeInteger(total),true,'money total must remain a safe integer');
    }
    return total;
  }
});
vm.runInContext(fs.readFileSync('render.js','utf8'), context);

const pending = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:0,quantity:'4',purchased:false}])`, context);
assert.equal(pending.estimatedTotal,460);
assert.equal(pending.pendingEstimated,460);
assert.equal(pending.accounted,0);

const fractional = vm.runInContext(`marketMetrics([{estimatedCents:250,actualCents:0,quantity:'1,5',purchased:false}])`, context);
assert.equal(fractional.estimatedTotal,375);

const purchasedFromSource = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:0,quantity:'4',purchased:true}])`, context);
assert.equal(purchasedFromSource.estimatedTotal,460);
assert.equal(purchasedFromSource.accounted,460);
assert.equal(purchasedFromSource.missingReal,1);
assert.equal(purchasedFromSource.variance,0);

const purchasedWithReceipt = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:110,quantity:'4',purchased:true}])`, context);
assert.equal(purchasedWithReceipt.accounted,440);
assert.equal(purchasedWithReceipt.missingReal,0);
assert.equal(purchasedWithReceipt.variance,-20);

const marketJs=fs.readFileSync('market-experience.js','utf8');
const forms=fs.readFileSync('forms.js','utf8');
const finance=fs.readFileSync('finance.js','utf8');
assert.match(marketJs,/estimatedCents:product\.priceCents,actualCents:0,purchased:false/);
assert.doesNotMatch(marketJs,/Mercadona|Open Prices/i);
assert.match(marketJs,/OFF_IMAGE_SEARCH_URL='https:\/\/world\.openfoodfacts\.org\/cgi\/search\.pl'/,'product imagery may use Open Food Facts without affecting financial accounting');
assert.match(forms,/market-quantity-stepper/);
assert.match(forms,/Subtotal automático/);
assert.match(forms,/marketLineCents\(cents,quantityInput\.value\)/);
assert.match(finance,/marketLineCents\(i\.actualCents \|\| i\.estimatedCents \|\| 0,i\.quantity\)/);

console.log('Market quantity x unit-price accounting invariants: OK');
