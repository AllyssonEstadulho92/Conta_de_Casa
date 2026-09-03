#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-AllyssonEstadulho92/Conta_de_Casa}"
KEYSTORE="${1:-conta-de-casa-release-v47.jks}"
DEFAULT_ALIAS="conta-de-casa-release"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) não encontrado. Instale e autentique com: gh auth login" >&2
  exit 1
fi

gh auth status >/dev/null

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Keystore não encontrado: $KEYSTORE" >&2
  exit 1
fi

read -r -p "Alias da chave [$DEFAULT_ALIAS]: " KEY_ALIAS
KEY_ALIAS="${KEY_ALIAS:-$DEFAULT_ALIAS}"

read -r -s -p "Password do keystore: " STORE_PASSWORD
echo
read -r -s -p "Password da chave: " KEY_PASSWORD
echo

if [[ -z "$STORE_PASSWORD" || -z "$KEY_PASSWORD" ]]; then
  echo "As passwords não podem ficar vazias." >&2
  exit 1
fi

if command -v keytool >/dev/null 2>&1; then
  keytool -list -keystore "$KEYSTORE" -storepass "$STORE_PASSWORD" -alias "$KEY_ALIAS" >/dev/null
  echo "Keystore e alias validados."
fi

KEYSTORE_B64="$(base64 < "$KEYSTORE" | tr -d '\n\r')"

printf '%s' "$KEYSTORE_B64" | gh secret set ANDROID_KEYSTORE_BASE64 --repo "$REPO"
printf '%s' "$KEY_ALIAS" | gh secret set ANDROID_KEY_ALIAS --repo "$REPO"
printf '%s' "$STORE_PASSWORD" | gh secret set ANDROID_KEYSTORE_PASSWORD --repo "$REPO"
printf '%s' "$KEY_PASSWORD" | gh secret set ANDROID_KEY_PASSWORD --repo "$REPO"

echo
echo "Secrets Android configuradas em $REPO."
echo "Agora execute o workflow 'Mobile Assets' manualmente ou aguarde a próxima CI bem-sucedida na main."
