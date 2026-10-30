'use strict';

// Impede que ficheiros pessoais ou credenciais entrem no código publicado.
// Executar antes de adicionar ficheiros ao Git: npm run privacy:check
// Nota: o CI corre depois do push. Não substitui revisão local nem elimina histórico público.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'})
  .split('\0').filter(Boolean);

const forbiddenPath=[
  /(?:^|\/)\.env(?:\.(?!example$)[^/]+)?$/i,
  /(?:^|\/)(?:private|personal-data|local-data|backups|receipts|invoices)(?:\/|$)/i,
  /(?:^|\/)Conta_de_Casa_backup_.*\.json$/i,
  /(?:^|\/)[^/]*backup_cifrado[^/]*\.json$/i,
  /(?:^|\/)[^/]*(?:fatura_pessoal|comprovativo_pessoal|extrato_bancario)[^/]*$/i,
  /\.(?:pem|p12|pfx|key|sqlite|sqlite3|db|db3)$/i
];
const secretContent=[
  /\b(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/
];
let forbiddenFiles=0;
let credentialFiles=0;
for(const relative of tracked){
  if(forbiddenPath.some(rx=>rx.test(relative))){
    forbiddenFiles++;
    continue;
  }
  const full=path.join(root,relative);
  let stat;
  try{stat=fs.lstatSync(full);}catch{continue;}
  if(!stat.isFile()||stat.size>5*1024*1024)continue;
  const raw=fs.readFileSync(full);
  if(raw.includes(0))continue;
  if(secretContent.some(rx=>rx.test(raw.toString('utf8'))))credentialFiles++;
}
if(forbiddenFiles||credentialFiles){
  // Nunca imprimir linhas suspeitas, tokens, nomes de faturas ou conteúdos no log público.
  console.error('Bloqueada a publicação: foram detetados ficheiros privados ou possíveis segredos no Git.');
  console.error('Ficheiros com caminho proibido: '+forbiddenFiles+'; ficheiros com potencial segredo: '+credentialFiles+'.');
  process.exitCode=1;
}else{
  console.log('Verificação preventiva de privacidade concluída. Não substitui auditoria manual nem inspeção do histórico Git.');
}
