const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({
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

const pending = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:0,purchased:false}])`, context);
assert.equal(pending.estimatedTotal,510);
assert.equal(pending.pendingEstimated,510);
assert.equal(pending.accounted,0);

const purchasedFromSource = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:0,purchased:true}])`, context);
assert.equal(purchasedFromSource.estimatedTotal,510);
assert.equal(purchasedFromSource.accounted,510);
assert.equal(purchasedFromSource.missingReal,1);
assert.equal(purchasedFromSource.variance,0);

const purchasedWithReceipt = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:495,purchased:true}])`, context);
assert.equal(purchasedWithReceipt.accounted,495);
assert.equal(purchasedWithReceipt.missingReal,0);
assert.equal(purchasedWithReceipt.variance,-15);

const marketJs=fs.readFileSync('market-experience.js','utf8');
assert.match(marketJs,/estimatedCents:product\.priceCents,actualCents:0,purchased:false/);
assert.doesNotMatch(marketJs,/preços de demonstração|valores de demonstração|DEMO_PRODUCTS/i);

console.log('Live market price accounting invariants: OK');
