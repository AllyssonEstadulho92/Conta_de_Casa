# Conta de Casa Mobile Native

Primeira fundação nativa da aplicação, criada sem reutilizar o runtime Web/PWA. Esta entrega implementa a área **Animais → Walli → Partilha com Nuno** em React Native + Expo SDK 57, com TypeScript strict.

## Funcionalidade incluída

- ecrã Animais com foco na partilha do Walli;
- registo de períodos em que o Walli fica com o Nuno;
- calendário mensal dos dias registados;
- histórico e edição/eliminação de registos;
- cálculo proporcional pelos dias reais do mês ou valor diário fixo;
- base mensal guardada por mês para não reescrever histórico;
- registo de reembolsos recebidos sem alterar a despesa/base original;
- persistência local em SQLite com SQLCipher;
- chave aleatória de 256 bits guardada no SecureStore do sistema;
- operações SQL parametrizadas e transações exclusivas nos registos de dias;
- prevenção de dias duplicados.

## Regra financeira

No modo proporcional:

`parte do cuidador = arredondar(base mensal × dias com o cuidador ÷ dias reais do mês)`

O arredondamento é feito uma única vez no total mensal e todo o domínio trabalha em cêntimos inteiros. Exemplo de teste: outubro de 2026 tem 31 dias; 120,00 € e 8 dias resultam em 30,97 € para o Nuno e 89,03 € para o proprietário.

O recebimento do Nuno é um reembolso separado. Não reduz nem edita retroativamente a base mensal, evitando dupla contagem e perda de auditabilidade.

## Execução

SQLCipher exige uma build nativa. O Expo Go não é suficiente.

```bash
cd apps/mobile-native
npm install
npm run check
npx expo prebuild
npm run ios
# ou
npm run android
```

## Estado

A área Animais está funcional nesta fundação. Início, Despesas e Mais continuam no projeto legado e ainda não foram migrados para a aplicação nativa. O código Web existente foi preservado sem alterações nesta entrega.


## Development build em dispositivo real

A aplicação usa `expo-dev-client` e perfis EAS em `eas.json`.

Primeira configuração da conta/projeto Expo, feita localmente pelo responsável do projeto:

```bash
cd apps/mobile-native
npm install
npx eas-cli@latest login
npx eas-cli@latest init
```

Build de desenvolvimento para iPhone físico:

```bash
npx eas-cli@latest build --profile development --platform ios
```

Build de desenvolvimento para Android físico:

```bash
npx eas-cli@latest build --profile development --platform android
```

Para simulador iOS:

```bash
npx eas-cli@latest build --profile development-simulator --platform ios
```

O `projectId` gerado pelo EAS deve ser associado ao projeto Expo pelo comando oficial de inicialização. Não deve ser inventado nem substituído manualmente por identificadores fictícios.
