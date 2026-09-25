'use strict';

const {test,expect}=require('@playwright/test');

const PASSCODE='12345678';
const ONE_PIXEL_PNG=Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZK7sAAAAASUVORK5CYII=',
  'base64'
);

async function createFreshVault(page){
  await page.goto('/');
  await expect(page.locator('#vaultCreate')).toBeVisible();
  await page.locator('#newPassphrase').fill(PASSCODE);
  await page.locator('#confirmPassphrase').fill(PASSCODE);
  await page.locator('#createVaultBtn').click();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#vaultScreen')).toBeHidden();
  await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
}

async function unlockExistingVault(page){
  await expect(page.locator('#vaultUnlock')).toBeVisible();
  const input=page.locator('#unlockPassphrase');
  if(await input.isEditable()){
    await input.fill(PASSCODE);
  }else{
    for(const digit of PASSCODE)await page.locator(`#vaultPinPad [data-pin-key="${digit}"]`).click();
  }
  await page.locator('#unlockVaultBtn').click();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#vaultScreen')).toBeHidden();
}

async function goTo(page,target){
  const desktop=page.locator(`#desktopNav [data-page="${target}"]`);
  if(await desktop.isVisible()){
    await desktop.click();
  }else{
    const mobile=page.locator(`#mobileNav [data-mobile="${target}"]`);
    await expect(mobile).toBeVisible();
    await mobile.tap();
  }
  await expect(page.locator(`#page-${target}`)).toHaveClass(/active/);
}

async function openNewBill(page){
  await goTo(page,'bills');
  await page.locator('#newBillBtn').click();
  await expect(page.locator('#formDialog')).toHaveAttribute('open','');
  await expect(page.locator('#billForm')).toBeVisible();
}

test('cofre local abre a aplicação mesmo sem rede depois dos assets carregarem',async({page,context})=>{
  await page.goto('/');
  await expect(page.locator('#vaultCreate')).toBeVisible();
  await context.setOffline(true);
  await page.locator('#newPassphrase').fill(PASSCODE);
  await page.locator('#confirmPassphrase').fill(PASSCODE);
  await page.locator('#createVaultBtn').click();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
  await expect(page.locator('body')).not.toBeEmpty();
});

test('fatura criada persiste após reload e novo desbloqueio',async({page})=>{
  await createFreshVault(page);
  await openNewBill(page);

  await page.locator('#billForm [name="title"]').fill('Internet E2E');
  await page.locator('#billForm [name="amount"]').fill('42,50');
  const selectedMonth=await page.locator('#monthPicker').inputValue();
  await page.locator('#billForm [name="dueDate"]').fill(`${selectedMonth}-15`);
  await page.locator('#billForm button[type="submit"]').click();

  await expect(page.locator('#formDialog')).not.toHaveAttribute('open','');
  await expect(page.locator('#billsList')).toContainText('Internet E2E');

  await page.reload();
  await unlockExistingVault(page);
  await goTo(page,'bills');
  await expect(page.locator('#billsList')).toContainText('Internet E2E');
  await expect(page.locator('#billsList')).toContainText('42,50');
});

test('bundle publicado usa ZXing local e não pede scripts ao unpkg',async({page})=>{
  const externalScriptRequests=[];
  page.on('request',request=>{
    if(request.resourceType()==='script'&&new URL(request.url()).origin!==new URL(page.url()||'http://127.0.0.1:4173').origin){
      externalScriptRequests.push(request.url());
    }
  });
  await createFreshVault(page);
  const reader=await page.locator('meta[name="barcode-reader-src"]').getAttribute('content');
  expect(reader).toBe('./vendor/zxing-browser.min.js');
  expect(externalScriptRequests.filter(url=>url.includes('unpkg.com'))).toEqual([]);

  const response=await page.request.get('/vendor/zxing-browser.min.js');
  expect(response.ok()).toBeTruthy();
  expect((await response.text()).length).toBeGreaterThan(10000);
});

test('filtros avançados ficam recolhidos no iPhone e continuam acessíveis',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='webkit-iphone','Contrato específico da geometria móvel WebKit');
  await createFreshVault(page);
  await goTo(page,'bills');

  await expect(page.locator('#billFiltersToggle')).toBeVisible();
  await expect(page.locator('#billFiltersToggle')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#billFilterGrid')).toBeHidden();

  await page.locator('#billFiltersToggle').click();
  await expect(page.locator('#billFiltersToggle')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#billFilterGrid')).toBeVisible();

  await page.locator('#billStatusFilter').selectOption('pending');
  await expect(page.locator('#billFilterCount')).toHaveText('1');
  await page.locator('#billClearFilters').click();
  await expect(page.locator('#billFilterGrid')).toBeHidden();
});

test('Ler fatura e QR Code abrem o picker nativo no WebKit sem bloquear o formulário',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='webkit-iphone','Validação do caminho nativo usado no iPhone');
  await createFreshVault(page);
  await openNewBill(page);

  const imageChooserPromise=page.waitForEvent('filechooser');
  await page.locator('#expenseModeImageInput').click();
  const imageChooser=await imageChooserPromise;
  await imageChooser.setFiles({name:'fatura-sem-qr.png',mimeType:'image/png',buffer:ONE_PIXEL_PNG});
  await expect(page.locator('#formDialog')).toHaveAttribute('open','');
  await expect(page.locator('#invoiceCaptureStatus')).toHaveText(/./,{timeout:15000});

  const qrChooserPromise=page.waitForEvent('filechooser');
  await page.locator('#expenseModeQrInput').click();
  const qrChooser=await qrChooserPromise;
  await qrChooser.setFiles({name:'qr-sem-codigo.png',mimeType:'image/png',buffer:ONE_PIXEL_PNG});
  await expect(page.locator('#formDialog')).toHaveAttribute('open','');
  await expect(page.locator('#billForm [name="title"]')).toBeEditable();

  await page.locator('#expenseModeManual').click();
  await expect(page.locator('#formDialog')).toHaveAttribute('data-v75-bill-mode','manual');
});
