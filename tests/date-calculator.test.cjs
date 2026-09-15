'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {webcrypto}=require('node:crypto');

const ROOT=path.resolve(__dirname,'..');
execFileSync(process.execPath,['scripts/build-typescript-runtime.cjs'],{cwd:ROOT,stdio:'pipe'});

const generated=fs.readFileSync(path.join(ROOT,'.generated/date-calculator.js'),'utf8');
const source=fs.readFileSync(path.join(ROOT,'src/ui/date-calculator.ts'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'date-calculator.css'),'utf8');
const prep=fs.readFileSync(path.join(ROOT,'scripts/prepare-pages.cjs'),'utf8');
const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');

assert.match(source,/76-date-calculator1/);
assert.match(source,/civilDayDiff/,'A calculadora deve reutilizar matemática civil existente.');
assert.match(source,/Feriados não são descontados/,'Dias úteis devem declarar a regra sem presumir feriados.');
assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|localStorage|indexedDB|saveState\s*\(|commit\s*\(/,'A ferramenta não deve aceder à rede nem persistir dados.');

assert.match(css,/76-date-calculator-layout2/,'O CSS deve declarar a autoridade visual canónica atual.');
assert.match(css,/76-date-calculator-mobile-spacing3/,'O ajuste móvel deve permanecer dentro da autoridade canónica da calculadora.');
assert.match(css,/76-date-calculator-prototype-inputs4/,'A composição aprovada do protótipo deve estar declarada na autoridade visual existente.');
assert.match(css,/--datecalc-space-1:4px/);
assert.match(css,/--datecalc-space-2:8px/);
assert.match(css,/--datecalc-space-3:12px/);
assert.match(css,/--datecalc-space-4:16px/);
assert.match(css,/--datecalc-space-5:20px/);
assert.match(css,/--datecalc-space-6:24px/);
assert.match(css,/--datecalc-space-8:32px/);
assert.match(css,/\.cdc-datecalc-workspace\s*\{\s*display:contents;/,'O layout deve ter uma única grelha visual sem duplicar markup ou lógica.');
assert.match(css,/grid-template-areas:\s*\n\s*"input facts"\s*\n\s*"result facts"\s*\n\s*"actions facts"/,'Desktop deve manter calculadora/resultado à esquerda e informação à direita.');
assert.match(css,/@media\(max-width:820px\)[\s\S]*grid-template-areas:\s*\n\s*"input"\s*\n\s*"facts"\s*\n\s*"result"\s*\n\s*"actions"/,'Mobile deve seguir calculadora → informação → resultado → ações.');
assert.match(css,/height:calc\(100svh - 16px\)/,'Safari/iOS deve usar altura estável do viewport.');
assert.doesNotMatch(css,/100dvh/,'A autoridade móvel final não deve voltar a depender de 100dvh.');
assert.match(css,/\.cdc-datecalc-input-action \.cdc-datecalc-inline-action[\s\S]*min-height:44px/,'A ação Hoje deve manter target tátil adequado.');
assert.match(css,/\.cdc-datecalc-options label[\s\S]*min-height:44px/,'Opções de contagem devem manter target tátil adequado.');
assert.match(css,/\.cdc-datecalc-input-action input\[type="date"\][\s\S]*padding-left:54px!important;[\s\S]*padding-right:76px!important/,'Os campos de data devem reservar espaço para calendário e ação Hoje.');
assert.match(css,/input\[type="date"\]::-webkit-calendar-picker-indicator[\s\S]*left:14px;[\s\S]*width:20px;[\s\S]*height:20px/,'O picker nativo deve ficar visível à esquerda sem criar uma segunda biblioteca de ícones.');
assert.match(css,/@media\(max-width:560px\)[\s\S]*\.cdc-datecalc-date-grid\{[\s\S]*display:flex;[\s\S]*flex-direction:column;[\s\S]*align-items:stretch;[\s\S]*gap:var\(--datecalc-space-2\)/,'Datas móveis devem formar um único grupo vertical compacto com gap de 8 px.');
assert.match(css,/@media\(max-width:560px\)[\s\S]*\.cdc-datecalc-date-grid>label\{[\s\S]*min-height:0!important;[\s\S]*margin:0!important/,'Labels móveis não devem herdar altura ou margens que criem vazio artificial.');
assert.match(css,/@media\(max-width:560px\)[\s\S]*\.cdc-datecalc-swap\{[\s\S]*align-self:stretch;[\s\S]*width:100%;[\s\S]*background:linear-gradient\(var\(--v76-border\),var\(--v76-border\)\) center\/100% 1px no-repeat/,'Trocar datas deve formar um eixo visual horizontal com controlo centrado.');
assert.match(css,/@media\(max-width:560px\)[\s\S]*\.cdc-datecalc-swap :is\(\.svg-icon,\.ui-icon-svg\)[\s\S]*width:44px!important;[\s\S]*height:44px!important/,'O controlo de troca deve preservar um target visual 44x44.');
assert.match(css,/@media\(max-width:560px\)[\s\S]*\.cdc-datecalc-options\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'A regra de contagem deve manter duas opções organizadas quando há largura suficiente.');
assert.match(css,/@media\(max-width:430px\)[\s\S]*\.cdc-datecalc-options\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/,'Em ecrãs estreitos a regra de contagem deve empilhar antes de comprimir texto.');
assert.match(css,/@media\(max-width:430px\)/);
assert.match(css,/@media\(max-width:360px\)/);
assert.match(css,/@media\(forced-colors:active\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(css,/https?:\/\//,'O CSS da calculadora não deve introduzir dependências remotas.');

assert.match(prep,/'date-calculator\.css'/);
assert.match(prep,/'date-calculator\.js': path\.join\(GENERATED, 'date-calculator\.js'\)/);
assert.match(prep,/date-calculator\.js\?v=\$\{DATE_CALCULATOR_REV\}/);
assert.match(sw,/date-calculator-layout2/,'O cache PWA deve preservar o token da autoridade visual base.');
assert.match(sw,/date-calculator-mobile-spacing3/,'O cache PWA deve preservar o token do agrupamento móvel compacto.');
assert.match(sw,/date-calculator-prototype-inputs4/,'O cache PWA deve invalidar a apresentação anterior dos campos de data.');
assert.match(sw,/'\.\/date-calculator\.css'/);
assert.match(sw,/'\.\/date-calculator\.js'/);
assert.doesNotThrow(()=>new vm.Script(generated),'O runtime gerado deve ser JavaScript clássico válido.');

const probe=`
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const context=vm.createContext({console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,BigInt,atob,btoa,globalThis:null});
context.globalThis=context;
vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('.generated/date-calculator.js','utf8'),context);
const out=vm.runInContext(\`(()=>{
  const api=CDCDateCalculator;
  return {
    forward:api.difference('2026-09-03','2026-09-15'),
    reverse:api.difference('2026-09-15','2026-09-03'),
    same:api.difference('2026-09-15','2026-09-15'),
    explicit:api.difference('2026-09-03','2026-09-15',true,true),
    monthEnd:api.calendarSpan('2024-01-31','2024-03-01'),
    fridayPlusBusiness:api.addDays('2026-09-11',1,'business'),
    mondayMinusBusiness:api.addDays('2026-09-14',-1,'business'),
    calendarPlus:api.addDays('2024-02-28',1,'calendar'),
    workWeek:api.businessDays('2026-09-14','2026-09-18',true,true),
    weekend:api.businessDays('2026-09-12','2026-09-13',true,true),
    dayOfYear:api.dayOfYear('2026-09-15'),
    weekday:api.weekdayName('2026-09-15'),
    invalid:api.difference('2026-02-30','2026-03-01')
  };
})()\`,context);
process.stdout.write(JSON.stringify(out));
`;

let baseline=null;
for(const tz of ['UTC','Europe/Lisbon','America/Los_Angeles','Pacific/Kiritimati']){
  const raw=execFileSync(process.execPath,['-e',probe],{cwd:ROOT,env:{...process.env,TZ:tz},encoding:'utf8'});
  const result=JSON.parse(raw);
  if(baseline===null)baseline=result;
  else assert.deepEqual(result,baseline,`Os resultados civis têm de ser idênticos em ${tz}.`);
}

const result=baseline;
assert.ok(result);
assert.equal(result.forward.elapsedDays,12);
assert.equal(result.forward.inclusiveDays,13);
assert.equal(result.forward.selectedDays,12);
assert.equal(result.forward.weeks,1);
assert.equal(result.forward.remainingDays,5);
assert.deepEqual(result.forward.span,{years:0,months:0,days:12});
assert.equal(result.reverse.direction,-1);
assert.equal(result.reverse.elapsedDays,12);
assert.equal(result.reverse.selectedDays,12);
assert.equal(result.same.elapsedDays,0);
assert.equal(result.same.inclusiveDays,1);
assert.equal(result.same.selectedDays,0);
assert.equal(result.explicit.selectedDays,13);
assert.deepEqual(result.monthEnd,{years:0,months:1,days:1});
assert.equal(result.fridayPlusBusiness,'2026-09-14');
assert.equal(result.mondayMinusBusiness,'2026-09-11');
assert.equal(result.calendarPlus,'2024-02-29');
assert.equal(result.workWeek.businessDays,5);
assert.equal(result.workWeek.weekendDays,0);
assert.equal(result.weekend.businessDays,0);
assert.equal(result.weekend.weekendDays,2);
assert.equal(result.dayOfYear,258);
assert.equal(result.weekday,'terça-feira');
assert.equal(result.invalid,null);

console.log('Date calculator: exact civil calculations + prototype-aligned mobile date input layout contract: OK');
