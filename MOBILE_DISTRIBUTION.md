# Distribuição móvel — Conta de Casa

## Estado v47

A aplicação continua PWA local-first e passa a ter uma fundação nativa com Capacitor para Android e iOS.

- Android: wrapper Capacitor validado por CI; o workflow gera um APK de verificação com package id isolado e só publica um APK de produção quando existe uma chave de assinatura estável nos GitHub Actions Secrets.
- iOS: wrapper Capacitor validado num runner macOS/Xcode sem assinatura; um IPA instalável/App Store exige certificados e provisioning próprios da Apple.
- Web/PWA: continua a ser a forma imediatamente instalável sem loja e sem assinatura nativa.

## Risco de dados ao mudar de PWA para APK/IPA

O WebView nativo tem um armazenamento próprio. O IndexedDB do Safari/Chrome não é automaticamente transferido para o APK/IPA.

Antes de mudar para uma versão nativa:

1. exporte um backup cifrado na aplicação atual; ou
2. confirme que a sincronização cifrada está atualizada;
3. instale a versão nativa;
4. restaure o backup cifrado ou configure a sincronização nesse novo dispositivo;
5. confirme os totais e a integridade antes de apagar o armazenamento antigo.

Nunca copie IndexedDB, tokens, PINs ou ficheiros de estado em claro.

## Assinatura Android

A chave de assinatura de produção nunca deve ser colocada no repositório público.

O workflow `.github/workflows/mobile-assets.yml` só publica `Conta-de-Casa-v47-Android.apk` quando estas quatro secrets existem:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

A mesma chave deve ser conservada para todas as versões futuras. Mudar a chave impede a atualização normal de instalações existentes.

Quando as secrets estão configuradas, o workflow:

1. compila o bundle local;
2. gera o projeto Android;
3. gera ícones/splash;
4. cria o APK release;
5. aplica `zipalign`;
6. assina com `apksigner`;
7. verifica a assinatura;
8. gera SHA-256;
9. publica APK + checksum no GitHub Release `v47`.

O botão Android em Definições consulta apenas a API pública de Releases do próprio repositório e só fica ativo quando existe um asset `.apk`.

## iOS

Capacitor 8 suporta iOS 15+ e exige Xcode 26+. A CI valida a compilação para simulador com assinatura desativada.

Para um IPA real ou App Store ainda são necessários, fora do repositório:

- Apple Developer Program;
- certificado de distribuição;
- App ID/bundle identifier;
- provisioning profile ou configuração equivalente do App Store Connect;
- gestão segura das credenciais de assinatura.

Nenhuma chave Apple, `.p12` ou `.mobileprovision` deve ser commitada.

## Dependências

As dependências nativas estão fixadas no `package.json`:

- Capacitor Core/CLI/Android/iOS 8.5.1;
- Capacitor Assets 3.0.5.

Estas dependências são usadas apenas para o empacotamento nativo; o motor financeiro, IndexedDB cifrado, backup e sincronização continuam no mesmo código web.

## Package IDs

Produção:

`io.github.allyssonestadulho92.contadecasa`

Builds de verificação em CI usam um sufixo `.verify` para não poderem substituir acidentalmente uma instalação de produção.


## Configuração das GitHub Actions Secrets

Para evitar copiar uma chave privada ou passwords para comandos que possam ficar no histórico do terminal, o repositório inclui:

`scripts/configure-android-signing.sh`

Uso local:

```bash
bash scripts/configure-android-signing.sh /caminho/para/conta-de-casa-release-v47.jks
```

O script:

1. exige uma sessão autenticada do GitHub CLI (`gh auth login`);
2. valida o keystore e o alias com `keytool`, quando disponível;
3. codifica o keystore em Base64 apenas em memória;
4. cria/atualiza as quatro Actions Secrets necessárias;
5. não escreve passwords, Base64 ou keystore no repositório.

Nunca execute o script com um keystore obtido de fonte não confiável.
