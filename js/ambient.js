// Site-wide ambient background + cursor aura. Decorative (aria-hidden);
// respects prefers-reduced-motion. Generalized from the home hero so it mounts
// on every page via _includes/ambient.html. See VISUAL-DESIGN.md Section 6.
//
// "Gentle Gather": particles drift toward the cursor and brighten, holding
// their spacing (never merging, never repelling). One engine, two intensities:
// bright on the home hero, dim on content/task pages. A `data-ambient="off"`
// attribute on <body> opts a page out entirely.
(function () {
    'use strict';

    var canvas = document.getElementById('ambient-bg');
    if (!canvas) return;

    var mode = (document.body.getAttribute('data-ambient') || '').toLowerCase();
    if (mode === 'off') return;

    var ctx = canvas.getContext('2d');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Bright on the home page, dim everywhere else. On the SPA, intensity is
    // re-evaluated on each route change (the canvas itself persists across
    // swaps because it lives outside the swapped content slot).
    var STAR_ALPHA = 0.55, LINK_ALPHA = 0.14;
    function applyIntensity(pathname) {
        var path = (pathname || location.pathname).replace(/\/index\.html$/, '/');
        var isHome = mode === 'bright' || (mode !== 'dim' && (path === '/' || path === ''));
        STAR_ALPHA = isHome ? 0.55 : 0.32;
        LINK_ALPHA = isHome ? 0.14 : 0.07;
    }
    applyIntensity();
    var LIT_MAX = 0.5;
    var PULL = 0.009;
    var PULL_RADIUS = 230;
    var MIN_GAP = 26;
    var LINK_DIST = 130;

    var PALETTE = ['78, 201, 176', '86, 156, 214', '220, 220, 170', '181, 206, 168', '156, 220, 254'];

    var nodes = [], width = 0, height = 0, dpr = 1, rafId = null;
    var mouse = { x: -9999, y: -9999, active: false };
    var damp = 1, dampTarget = 1, DAMP_TARGET = 0.25;

    function nodeCount() { return width < 640 ? 45 : 95; }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth; height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }
    function seed() {
        var n = nodeCount(); nodes = [];
        for (var i = 0; i < n; i++) {
            var x = Math.random() * width, y = Math.random() * height;
            nodes.push({
                x: x, y: y, hx: x, hy: y,
                vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
                r: 1.2 + Math.random() * 1.8, color: PALETTE[i % PALETTE.length], lit: 0
            });
        }
    }
    function step() {
        for (var k = 0; k < nodes.length; k++) {
            var p = nodes[k];
            p.x += p.vx; p.y += p.vy; p.hx += p.vx; p.hy += p.vy;
            if (p.x < -10) { p.x = width + 10; p.hx = width + 10; }
            if (p.x > width + 10) { p.x = -10; p.hx = -10; }
            if (p.y < -10) { p.y = height + 10; p.hy = height + 10; }
            if (p.y > height + 10) { p.y = -10; p.hy = -10; }

            if (mouse.active) {
                var dx = mouse.x - p.x, dy = mouse.y - p.y;
                var d = Math.hypot(dx, dy) || 0.001;
                if (d < PULL_RADIUS) {
                    var t = 1 - d / PULL_RADIUS;
                    var near = Math.min(1, (d - MIN_GAP) / (PULL_RADIUS - MIN_GAP));
                    var pull = PULL * t * Math.max(0, near) * damp;
                    p.x += dx * pull; p.y += dy * pull;
                    p.lit += (t * t * LIT_MAX * damp - p.lit) * 0.07;
                } else {
                    p.lit += (0 - p.lit) * 0.06;
                    p.x += (p.hx - p.x) * 0.01; p.y += (p.hy - p.y) * 0.01;
                }
            } else {
                p.lit += (0 - p.lit) * 0.06;
            }
        }
        // separation so gathered stars never merge into one point
        for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i]; if (a.lit < 0.05) continue;
            for (var j = i + 1; j < nodes.length; j++) {
                var b = nodes[j]; if (b.lit < 0.05) continue;
                var sx = a.x - b.x, sy = a.y - b.y, sd = Math.hypot(sx, sy) || 0.001;
                if (sd < MIN_GAP) {
                    var push = (MIN_GAP - sd) / sd * 0.5;
                    a.x += sx * push; a.y += sy * push; b.x -= sx * push; b.y -= sy * push;
                }
            }
        }
    }
    function draw() {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i];
            for (var j = i + 1; j < nodes.length; j++) {
                var b = nodes[j];
                var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    var t = 1 - Math.sqrt(d2) / LINK_DIST;
                    var litBoost = Math.max(a.lit, b.lit);
                    var alpha = t * (LINK_ALPHA + litBoost * 0.4);
                    ctx.strokeStyle = 'rgba(110, 160, 200, ' + alpha.toFixed(3) + ')';
                    ctx.lineWidth = 1 + litBoost * 0.6;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
        }
        for (var k = 0; k < nodes.length; k++) {
            var p = nodes[k], lit = p.lit, r = p.r * (1 + lit * 2.0);
            if (lit > 0.02) {
                var halo = 8 + lit * 24;
                var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, halo);
                g.addColorStop(0, 'rgba(' + p.color + ', ' + (0.6 * lit).toFixed(3) + ')');
                g.addColorStop(0.4, 'rgba(' + p.color + ', ' + (0.2 * lit).toFixed(3) + ')');
                g.addColorStop(1, 'rgba(' + p.color + ', 0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(p.x, p.y, halo, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = 'rgba(' + p.color + ', ' + (STAR_ALPHA + lit * 0.4).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        }
    }
    function loop() { damp += (dampTarget - damp) * 0.1; step(); draw(); rafId = requestAnimationFrame(loop); }
    function start() { stop(); if (reduceMotion.matches) draw(); else rafId = requestAnimationFrame(loop); }
    function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    // SPA route changes: re-evaluate dim/bright without restarting the field.
    document.addEventListener('spa:navigate', function (e) {
        applyIntensity(e.detail && e.detail.pathname);
    });

    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { resize(); start(); }, 150); });
    reduceMotion.addEventListener('change', start);

    // shared mouse tracking (also drives the cursor aura via --mouse-x/y).
    var root = document.documentElement;
    var INTERACTIVE = 'a, button, input, textarea, select, [role="button"], .lights-up,' +
        ' .result-card, .tool-card, .guide-card, .review-card';
    var cs = getComputedStyle(root);
    var AURA_REST = (cs.getPropertyValue('--aura-strength') || '0.10').trim();
    var AURA_HOVER = (cs.getPropertyValue('--aura-strength-hover') || '0.04').trim();
    document.addEventListener('pointermove', function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
        root.style.setProperty('--mouse-x', e.clientX + 'px');
        root.style.setProperty('--mouse-y', e.clientY + 'px');
        // over an interactive element -> damp the gather + dim the aura, so the
        // element's own light-up is the single clear signal (Step-Back Rule).
        var over = e.target && e.target.closest && e.target.closest(INTERACTIVE);
        dampTarget = over ? DAMP_TARGET : 1;
        root.style.setProperty('--aura-strength', over ? AURA_HOVER : AURA_REST);
    });
    document.addEventListener('pointerleave', function () {
        mouse.active = false; mouse.x = -9999; mouse.y = -9999;
        root.style.setProperty('--mouse-x', '-9999px');
        root.style.setProperty('--mouse-y', '-9999px');
    });

    resize(); start();
})();
