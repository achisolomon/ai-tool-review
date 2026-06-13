// Full-viewport constellation map. Decorative only (aria-hidden); respects prefers-reduced-motion.
(function () {
    'use strict';

    const canvas = document.getElementById('hero-map');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const PALETTE = [
        { color: '78, 201, 176' },   // teal
        { color: '86, 156, 214' },   // blue
        { color: '220, 220, 170' },  // yellow
        { color: '181, 206, 168' },  // green
        { color: '156, 220, 254' }   // light blue
    ];

    const LINK_DIST = 130;
    const MOUSE_RADIUS = 150;

    let nodes = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;
    let mouse = { x: -9999, y: -9999 };

    function nodeCount() {
        return width < 640 ? 45 : 95;
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }

    function seed() {
        const n = nodeCount();
        nodes = [];
        for (let i = 0; i < n; i++) {
            const cluster = PALETTE[i % PALETTE.length];
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: 1.2 + Math.random() * 1.8,
                color: cluster.color
            });
        }
    }

    function step() {
        for (const p of nodes) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const force = (MOUSE_RADIUS - d) / MOUSE_RADIUS * 0.7;
                p.x += (dx / d) * force;
                p.y += (dy / d) * force;
            }
        }
    }

    function draw() {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    const t = 1 - Math.sqrt(d2) / LINK_DIST;
                    ctx.strokeStyle = 'rgba(110, 160, 200, ' + (t * 0.14).toFixed(3) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (const p of nodes) {
            ctx.fillStyle = 'rgba(' + p.color + ', 0.55)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop() {
        step();
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        stop();
        if (reduceMotion.matches) {
            draw();
        } else {
            rafId = requestAnimationFrame(loop);
        }
    }

    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    const root = document.documentElement;

    document.addEventListener('pointermove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        root.style.setProperty('--mouse-x', e.clientX + 'px');
        root.style.setProperty('--mouse-y', e.clientY + 'px');
    });
    document.addEventListener('pointerleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
        root.style.setProperty('--mouse-x', '-9999px');
        root.style.setProperty('--mouse-y', '-9999px');
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); start(); }, 150);
    });

    reduceMotion.addEventListener('change', start);

    resize();
    start();
})();
