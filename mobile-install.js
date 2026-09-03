'use strict';

(() => {
  const RELEASE_API = 'https://api.github.com/repos/AllyssonEstadulho92/Conta_de_Casa/releases/latest';
  let installPrompt = null;

  const $m = selector => document.querySelector(selector);
  const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = () => /Android/i.test(navigator.userAgent);
  const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  const isNative = () => Boolean(window.Capacitor?.isNativePlatform?.());

  function setStatus(message, kind = '') {
    const el = $m('#mobileInstallStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `form-message mobile-install-status ${kind}`.trim();
  }

  function trustedReleaseAssetUrl(asset) {
    if (!asset?.browser_download_url) return '';
    try {
      const url = new URL(asset.browser_download_url);
      const prefix = '/AllyssonEstadulho92/Conta_de_Casa/releases/download/';
      return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith(prefix) ? url.href : '';
    } catch (_err) {
      return '';
    }
  }

  function setDownload(anchor, asset, fallbackLabel) {
    if (!anchor) return;
    const trustedUrl = trustedReleaseAssetUrl(asset);
    if (trustedUrl) {
      anchor.href = trustedUrl;
      anchor.removeAttribute('aria-disabled');
      anchor.classList.remove('disabled');
      anchor.textContent = `Baixar ${asset.name}`;
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      return;
    }
    anchor.removeAttribute('href');
    anchor.setAttribute('aria-disabled', 'true');
    anchor.classList.add('disabled');
    anchor.textContent = fallbackLabel;
  }

  async function loadReleaseAssets() {
    const android = $m('#androidApkDownload');
    const ios = $m('#iosIpaDownload');
    const meta = $m('#mobileReleaseMeta');
    if (!android && !ios) return;

    try {
      const response = await fetch(RELEASE_API, {
        headers:{Accept:'application/vnd.github+json'},
        cache:'no-store',
        credentials:'omit',
        referrerPolicy:'no-referrer'
      });
      if (!response.ok) throw new Error('release-unavailable');
      const release = await response.json();
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const apk = assets.find(asset => /\.apk$/i.test(asset?.name || ''));
      const ipa = assets.find(asset => /\.ipa$/i.test(asset?.name || ''));
      setDownload(android, apk, 'APK assinado ainda não publicado');
      setDownload(ios, ipa, 'IPA assinado ainda não publicado');
      if (meta) {
        const version = String(release.name || release.tag_name || '').trim();
        meta.textContent = version ? `Última versão nativa publicada: ${version}` : 'Release móvel encontrada.';
      }
    } catch (_err) {
      setDownload(android, null, 'APK assinado ainda não publicado');
      setDownload(ios, null, 'IPA assinado ainda não publicado');
      if (meta) meta.textContent = 'Nenhum pacote nativo assinado foi publicado ainda.';
    }
  }

  function updateInstallUi() {
    const button = $m('#installPwaBtn');
    const hint = $m('#installPwaHint');
    if (!button) return;

    if (isNative()) {
      button.disabled = true;
      button.textContent = 'Aplicação nativa instalada';
      if (hint) hint.textContent = 'Está a usar o contentor nativo da Conta de Casa.';
      return;
    }
    if (isStandalone()) {
      button.disabled = true;
      button.textContent = 'Aplicação instalada';
      if (hint) hint.textContent = 'A versão web já está instalada neste dispositivo.';
      return;
    }
    if (installPrompt) {
      button.disabled = false;
      button.textContent = 'Instalar aplicação';
      if (hint) hint.textContent = 'Instala a PWA sem transferir os seus dados para terceiros.';
      return;
    }
    button.disabled = false;
    button.textContent = isIos() ? 'Como instalar no iPhone/iPad' : 'Como instalar';
    if (hint) {
      hint.textContent = isIos()
        ? 'No Safari: Partilhar → Adicionar ao Ecrã Principal.'
        : 'Se o navegador suportar instalação, a opção aparecerá automaticamente.';
    }
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateInstallUi();
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    updateInstallUi();
    setStatus('Aplicação instalada neste dispositivo.', 'success');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const button = $m('#installPwaBtn');
    button?.addEventListener('click', async () => {
      if (installPrompt) {
        try {
          await installPrompt.prompt();
          const choice = await installPrompt.userChoice;
          installPrompt = null;
          updateInstallUi();
          setStatus(choice?.outcome === 'accepted' ? 'Instalação iniciada.' : 'Instalação cancelada.', choice?.outcome === 'accepted' ? 'success' : '');
        } catch (_err) {
          setStatus('Não foi possível abrir o instalador deste navegador.', 'error');
        }
        return;
      }
      if (isIos()) {
        setStatus('No Safari, toque em Partilhar e escolha “Adicionar ao Ecrã Principal”.');
      } else if (isAndroid()) {
        setStatus('Abra o menu do navegador e escolha “Instalar aplicação” ou “Adicionar ao ecrã principal”.');
      } else {
        setStatus('Use a opção de instalação do seu navegador para adicionar a Conta de Casa ao dispositivo.');
      }
    });

    updateInstallUi();
    loadReleaseAssets();
  });
})();
