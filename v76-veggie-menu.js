"use strict";
/* Runtime gerado a partir de src/ui/veggie-menu-toggle.ts. */
(function installVeggieMenuToggle(root) {
    let installed = false;
    let scheduled = 0;
    function queryElements() {
        const button = document.querySelector('#mobileMenuBtn');
        const drawer = document.querySelector('#mobileDrawer');
        const drawerHead = drawer?.querySelector('.drawer-head') ?? null;
        const drawerShell = drawer?.querySelector('.nav-drawer-shell') ?? null;
        if (!button || !drawer || !drawerHead || !drawerShell)
            return null;
        return { button, drawer, drawerHead, drawerShell };
    }
    function prefersReducedMotion() {
        return root.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    }
    function schedule(callback) {
        if (scheduled)
            root.cancelAnimationFrame(scheduled);
        scheduled = root.requestAnimationFrame(() => {
            scheduled = 0;
            callback();
        });
    }
    function install() {
        if (installed)
            return;
        const elements = queryElements();
        if (!elements)
            return;
        installed = true;
        const { button, drawer, drawerHead, drawerShell } = elements;
        button.classList.add('veggie-menu-toggle');
        let sentinel = button.querySelector(':scope > svg.mobile-menu-icon-sentinel');
        if (!sentinel)
            sentinel = button.querySelector(':scope > svg.ui-icon-svg');
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
        const moveToDrawerOverlay = () => {
            if (!drawer.open)
                return;
            if (button.parentElement !== drawer)
                drawer.insertBefore(button, drawerShell);
            button.classList.add('drawer-menu-control', 'drawer-menu-overlay-control');
        };
        const animateGlyph = (state) => {
            if (prefersReducedMotion() || typeof upperLine.animate !== 'function' || typeof lowerLine.animate !== 'function')
                return;
            upperLine.getAnimations().forEach(animation => animation.cancel());
            lowerLine.getAnimations().forEach(animation => animation.cancel());
            const opening = state === 'open';
            const upperClosed = { top: '4px', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 };
            const upperOpen = { top: '8px', transform: 'translateX(-50%) rotate(45deg)', opacity: 1 };
            const lowerClosed = { top: '12px', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 };
            const lowerOpen = { top: '8px', transform: 'translateX(-50%) rotate(-45deg)', opacity: 1 };
            const timing = {
                duration: 230,
                easing: 'cubic-bezier(.32,.72,0,1)',
                fill: 'none'
            };
            upperLine.animate(opening ? [upperClosed, upperOpen] : [upperOpen, upperClosed], timing);
            lowerLine.animate(opening ? [lowerClosed, lowerOpen] : [lowerOpen, lowerClosed], timing);
            glyph.animate(opening
                ? [{ transform: 'scale(.94)' }, { transform: 'scale(1.035)', offset: .7 }, { transform: 'scale(1)' }]
                : [{ transform: 'scale(1.02)' }, { transform: 'scale(.96)', offset: .55 }, { transform: 'scale(1)' }], timing);
        };
        let previousState = button.getAttribute('aria-expanded') === 'true' ? 'open' : 'closed';
        const syncVisualState = (withAnimation = true) => {
            const state = button.getAttribute('aria-expanded') === 'true' ? 'open' : 'closed';
            button.dataset.veggieState = state;
            glyph.dataset.veggieState = state;
            if (drawer.open)
                moveToDrawerOverlay();
            if (!drawer.open)
                button.classList.remove('drawer-menu-overlay-control');
            if (state !== previousState) {
                if (withAnimation)
                    animateGlyph(state);
                button.dataset.veggieMotion = state === 'open' ? 'opening' : 'closing';
                previousState = state;
                root.setTimeout(() => delete button.dataset.veggieMotion, 260);
            }
        };
        const syncSoon = () => schedule(() => syncVisualState(true));
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
            if (drawer.open && button.parentElement === drawerHead)
                moveToDrawerOverlay();
            syncSoon();
        });
        headObserver.observe(drawerHead, { childList: true });
        drawer.addEventListener('close', syncSoon);
        drawer.addEventListener('cancel', syncSoon);
        syncVisualState(false);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', install, { once: true });
    else
        install();
})(window);
