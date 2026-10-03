import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
    'https://zajqhodbbxwzkauupsch.supabase.co',
    'sb_publishable_Yu8voA0zf_wgOHIMRMwTNg_7A_tb__T'
);

// ── CARDS ────────────────────────────────────────────────────

function cardHTML(v) {
    const cover = v.cover_url || `assets/covers/${v.id}.jpg`;
    return `
        <a class="card" href="vinyle.html?id=${v.id}">
            <img src="${cover}" alt="${v.nom}" loading="lazy" />
            <div class="card-info">
                <div class="card-album">${v.nom}</div>
                <div class="card-artist">${v.artiste}</div>
            </div>
        </a>`;
}

function envieCardHTML(v) {
    const cover = v.cover_url || `assets/covers/${v.id}.jpg`;
    return `
        <a class="card" href="envies.html">
            <img src="${cover}" alt="${v.nom}" loading="lazy" />
            <div class="card-info">
                <div class="card-album">${v.nom}</div>
                <div class="card-artist">${v.artiste}</div>
            </div>
        </a>`;
}

function renderGrid(id, items, renderFn = cardHTML) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!items || !items.length) {
        el.innerHTML = '<div class="empty">Aucun vinyle pour l\'instant</div>';
        return;
    }
    el.innerHTML = items.map(renderFn).join('');
}

// ── SUPABASE ─────────────────────────────────────────────────

async function init() {
    try {
        const { data: nouveaux } = await supabase
            .from('vinyles')
            .select('id, nom, artiste, cover_url')
            .eq('type', 'collection')
            .order('date_acquisition', { ascending: false })
            .limit(6);

        const { data: enviesRaw } = await supabase
            .from('envies')
            .select('id, nom, artiste, cover_url');

        // 6 envies aléatoires
        const envies = enviesRaw
            ? enviesRaw.sort(() => Math.random() - 0.5).slice(0, 6)
            : [];

        renderGrid('grid-nouveaux', nouveaux);
        renderGrid('grid-envies', envies, envieCardHTML);

        // Drag-to-scroll activé après le rendu des cards
        if (window.innerWidth >= 768) {
            enableDragScroll(document.getElementById('grid-nouveaux'));
            enableDragScroll(document.getElementById('grid-envies'));
        }

    } catch (err) {
        console.error(err);
    }
}

// ── DRAG TO SCROLL ───────────────────────────────────────────

function enableDragScroll(el) {
    if (!el) return;
    let isDown = false;
    let startX, scrollLeft;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        el.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
    });

    el.style.cursor = 'grab';
}

init();

// ── MENU ─────────────────────────────────────────────────────

const overlay   = document.getElementById('menuOverlay');
const hamburger = document.querySelector('.hamburger');
const closeBtn  = document.getElementById('menuClose');

hamburger?.addEventListener('click', () => overlay.classList.add('open'));
closeBtn?.addEventListener('click',  () => overlay.classList.remove('open'));
overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
});