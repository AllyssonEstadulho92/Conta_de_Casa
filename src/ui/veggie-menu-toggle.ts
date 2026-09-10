/* Conta de Casa v76 — Veggie Burger em TypeScript.
   Camada visual incremental: duas linhas -> X, preservando o controlador v73 do drawer. */

type VeggieMenuElements = {
  button: HTMLButtonElement;
  drawer: HTMLDialogElement;
  drawerHead: HTMLElement;
  drawerShell: HTMLElement;
};

(function installVeggieMenuToggle(root: Window) {
  let installed = false;
  let scheduled = 0;

  function queryElements(): VeggieMenuElements | null {
    const button = document.querySelector<HTMLButtonElement>('#mobileMenuBtn');
    const drawer = document.querySelector<HTMLDialogElement>('#mobileDrawer');
    const drawerHead = drawer?.querySelector<HTMLElement>('.drawer-head') ?? null;
    const drawerShell = drawer?.querySelector<HTMLElement>('.nav-drawer-shell') ?? null;
    if (!button || !drawer || !drawerHead || !drawerShell) return null;
    return { button, drawer, drawerHead, drawerShell };
  }

  function schedule(callback: () => void): void {
    if (scheduled) root.cancelAnimationFrame(scheduled);
    scheduled = root.requestAnimationFrame(() => {
      scheduled = 0;
      callback();
    });
  }

  function install(): void {
    if (installed) return;
    const elements = queryElements();
    if (!elements) return;
    installed = true;

    const { button, drawer, drawerHead, drawerShell } = elements;
    button.classList.add('veggie-menu-toggle');

    let sentinel = button.querySelector<SVGSVGElement>(':scope > svg.mobile-menu-icon-sentinel');
    if (!sentinel) {
      sentinel = button.querySelector<SVGSVGElement>(':scope > svg.ui-icon-svg');
    }
    if (!sentinel) {
      sentinel = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      sentinel.classList.add('ui-icon-svg');
      sentinel.setAttribute('hidden', '');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.setAttribute('focusable', 'false');
    }
    sentinel.classList.add('mobile-menu-icon-sentinel');

    const glyph = document.createElement('span');
    glyph.className = 'mobile-menu-glyph veggie-menu-glyph';
    glyph.setAttribute('aria-hidden', 'true');

    const upperLine = document.createElement('span');
    const lowerLine = document.createElement('span');
    upperLine.className = 'veggie-menu-line veggie-menu-line-upper';
    lowerLine.className = 'veggie-menu-line veggie-menu-line-lower';
    glyph.append(upperLine, lowerLine);

    button.dataset.uiIconSlot = 'menu';
    button.replaceChildren(glyph, sentinel);

    const moveToDrawerOverlay = (): void => {
      if (!drawer.open) return;
      if (button.parentElement === drawer) return;
      drawer.insertBefore(button, drawerShell);
      button.classList.add('drawer-menu-control', 'drawer-menu-overlay-control');
    };

    const syncVisualState = (): void => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const state = expanded ? 'open' : 'closed';
      button.dataset.veggieState = state;
      glyph.dataset.veggieState = state;

      if (drawer.open) moveToDrawerOverlay();
      if (!drawer.open) button.classList.remove('drawer-menu-overlay-control');
    };

    const syncSoon = (): void => schedule(syncVisualState);

    const buttonObserver = new MutationObserver(syncSoon);
    buttonObserver.observe(button, {
      attributes: true,
      attributeFilter: ['aria-expanded', 'data-menu-state']
    });

    const drawerObserver = new MutationObserver(syncSoon);
    drawerObserver.observe(drawer, {
      attributes: true,
      attributeFilter: ['open', 'class', 'data-dragging', 'data-closing'],
      childList: true
    });

    const headObserver = new MutationObserver(() => {
      if (drawer.open && button.parentElement === drawerHead) moveToDrawerOverlay();
      syncSoon();
    });
    headObserver.observe(drawerHead, { childList: true });

    drawer.addEventListener('close', syncSoon);
    drawer.addEventListener('cancel', syncSoon);

    button.addEventListener('animationend', () => {
      delete button.dataset.veggieMotion;
    });

    let previousExpanded = button.getAttribute('aria-expanded');
    const motionObserver = new MutationObserver(() => {
      const expanded = button.getAttribute('aria-expanded');
      if (expanded === previousExpanded) return;
      previousExpanded = expanded;
      button.dataset.veggieMotion = expanded === 'true' ? 'opening' : 'closing';
    });
    motionObserver.observe(button, { attributes: true, attributeFilter: ['aria-expanded'] });

    syncVisualState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})(window);
