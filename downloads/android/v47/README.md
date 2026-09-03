# Android APK — Conta de Casa v47

Esta pasta identifica a distribuição Android da versão v47.

Os binários não são commitados no repositório público. Eles são gerados pelo workflow **Mobile Assets** e ficam organizados assim dentro do artifact:

```text
mobile-release/
└── android/
    └── v47/
        ├── verification/
        │   ├── Conta-de-Casa-v47-Android-verification.apk
        │   └── Conta-de-Casa-v47-Android-verification.sha256
        └── production/
            ├── Conta-de-Casa-v47-Android.apk
            └── Conta-de-Casa-v47-Android.sha256
```

- `verification`: build de teste, com package id isolado.
- `production`: build oficial, só criado quando a assinatura Android de produção estiver configurada.

Isto evita misturar APKs de teste e produção e mantém o repositório sem binários gerados.


## Ficheiro instalável no próprio repositório

Depois de uma execução bem-sucedida de `Mobile Assets` na `main`, o workflow copia automaticamente para esta pasta:

- `Conta-de-Casa-v47-Android-verification.apk`
- `Conta-de-Casa-v47-Android-verification.sha256`

Assim, o APK de teste fica disponível diretamente em `downloads/android/v47/`, ao lado deste README, sem depender apenas da área de Artifacts.

O nome contém `verification` de propósito: este APK usa a identidade isolada de teste e não deve ser confundido com o APK de produção assinado.
