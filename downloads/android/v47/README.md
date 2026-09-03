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
