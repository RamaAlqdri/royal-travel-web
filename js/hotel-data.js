/* ===== Royal Travel - Hotel Listing ===== */

(() => {
  // ========= CONFIG =========
  const API_BASE = 'http://localhost:3000';           // ganti jika perlu
  const LIST_ENDPOINT = `${API_BASE}/api/hotels`;
  const DEFAULT_LIMIT = 12;

  // ========= HELPERS =========
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getId = (h) => h?.id ?? h?._id ?? h?.slug ?? '';
  const detailHref = (h) => `hotel-info.html?id=${encodeURIComponent(getId(h))}`;
  const mediaUrl = (m) => {
    if (!m) return 'img/hotels/placeholder.jpg';
    const u = m?.sizes?.small?.url || m?.url || m?.thumbnailURL;
    if (!u) return 'img/hotels/placeholder.jpg';
    return u.startsWith('http') ? u : API_BASE + u;
  };
  const toTextFromLexical = (lex) => {
    try {
      const paras = lex?.root?.children ?? [];
      return paras.map(p => (p.children || []).map(t => t.text || '').join(' ')).join('\n\n');
    } catch { return ''; }
  };

  async function fetchJSON(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  function buildQuery({ page = 1, limit = DEFAULT_LIMIT, search = '', island = '', sort = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    params.set('depth', '1');
    // sort by createdAt desc default (baru duluan)
    params.set('sort', sort || '-createdAt');

    // simple search: name / island contains (server-side tergantung backend; kalau tidak ada, bisa filter client-side)
    if (search) params.set('where[name][like]', search);

    if (island) params.set('where[island][equals]', island.toUpperCase());

    return `${LIST_ENDPOINT}?${params.toString()}`;
  }

  // ========= RENDERING =========
  function renderCard(hotel) {
    const id = getId(hotel);
    const href = detailHref(hotel);
    const img = mediaUrl(hotel?.media?.hero);
    const island = (hotel?.island || '').toString();
    const price = hotel?.starting_price;

    const col = document.createElement('div');
    col.className = 'item col-xl-4 col-lg-6 hotel-item';
    col.dataset.island = island.toLowerCase();
    if (price != null) col.dataset.startingPrice = price;

    col.innerHTML = `
      <div class="box_cat_rooms bg_white shadow rounded-3 mb-4">
        <figure class="m-0">
          <a href="${href}">
            <img src="${img}" alt="${hotel?.name || 'Hotel'}" class="img-fluid rounded-top"
                 onerror="this.src='img/hotels/placeholder.jpg'">
          </a>
        </figure>
        <div class="info p-4">
          <small class="text-muted text-uppercase" style="letter-spacing:2px;">${island || '-'}</small>
          <h3 class="mb-1 mt-2" style="font-size:1.25rem;">
            <a href="${href}" class="text-decoration-none">${hotel?.name || 'Unnamed Hotel'}</a>
          </h3>
          <p class="mb-3 text-secondary">${hotel?.type || ''}</p>
          <div class="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
            <span class="price fw-bold">${price != null ? `From $${price}/night` : 'Contact for price'}</span>
            <a href="${href}" class="text-decoration-none text-muted">View Details <i class="bi bi-arrow-right ms-1"></i></a>
          </div>
        </div>
      </div>
    `;
    return col;
  }

  function renderList(data) {
    const grid = $('#hotel-grid');
    grid.innerHTML = '';

    const docs = data?.docs || [];
    if (!docs.length) {
      grid.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-search" style="font-size:2rem;"></i>
          <p class="mt-2 mb-0">No hotels found.</p>
        </div>`;
      return;
    }

    docs.forEach(h => grid.appendChild(renderCard(h)));
  }

  function renderPagination({ page, totalPages, hasPrevPage, hasNextPage }) {
    const ul = $('#pagination-container');
    if (!ul) return;
    ul.innerHTML = '';

    const makeItem = (label, p, disabled = false, active = false) => {
      const li = document.createElement('li');
      li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#" data-page="${p}">${label}</a>`;
      return li;
    };

    ul.appendChild(makeItem('«', page - 1, !hasPrevPage));
    for (let i = 1; i <= totalPages; i++) {
      ul.appendChild(makeItem(i, i, false, i === page));
    }
    ul.appendChild(makeItem('»', page + 1, !hasNextPage));
  }

  // ========= STATE & UI =========
  const state = {
    page: 1,
    limit: DEFAULT_LIMIT,
    search: '',
    island: '',
    sort: '' // 'price_high' | 'price_low' -> nanti diurutkan client-side kalau server tak dukung
  };

  // Fetch + Render with optional client-side sorting if needed
  async function load() {
    const url = buildQuery(state);
    try {
      // NOTE: kalau CORS error, aktifkan CORS di backend atau jalankan front-end dari domain/port yang sama.
      const data = await fetchJSON(url);

      // Client-side sorting untuk harga (jika server belum support)
      if (state.sort && Array.isArray(data.docs)) {
        const docs = data.docs.slice();
        if (state.sort === 'price_high') {
          docs.sort((a, b) => (b.starting_price ?? 0) - (a.starting_price ?? 0));
        } else if (state.sort === 'price_low') {
          docs.sort((a, b) => (a.starting_price ?? 0) - (b.starting_price ?? 0));
        }
        // replace only for render (jangan ubah pagination meta)
        renderList({ ...data, docs });
      } else {
        renderList(data);
      }

      renderPagination({
        page: data.page ?? state.page,
        totalPages: data.totalPages ?? 1,
        hasPrevPage: !!data.hasPrevPage,
        hasNextPage: !!data.hasNextPage
      });
    } catch (err) {
      console.error('Failed to load hotels:', err);
      const grid = $('#hotel-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="col-12 text-center text-danger py-5">
            <p class="mb-1">Failed to fetch hotels.</p>
            <small>Check your server & CORS settings.</small>
          </div>`;
      }
    }
  }

  // ========= EVENT WIRING =========
  function wireUI() {
    const searchInput = $('#hotel-search');
    const islandSelect = $('#island-filter');
    const sortSelect = $('#sort-filter');
    const pagination = $('#pagination-container');

    // Search
    if (searchInput) {
      let t;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.search = e.target.value.trim();
          state.page = 1;
          load();
        }, 250);
      });
    }

    // Island filter
    if (islandSelect) {
      islandSelect.addEventListener('change', (e) => {
        state.island = e.target.value; // ex: 'ntb' | '' (server expect uppercase; builder sudah uppercase)
        state.page = 1;
        load();
      });
    }

    // Sort
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const v = e.target.value; // '' | 'price_high' | 'price_low'
        state.sort = v;
        state.page = 1;
        load();
      });
    }

    // Pagination
    if (pagination) {
      pagination.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-page]');
        if (!a) return;
        e.preventDefault();
        const p = parseInt(a.getAttribute('data-page'), 10);
        if (!Number.isNaN(p)) {
          state.page = p;
          load();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireUI();
    load();
  });
})();
