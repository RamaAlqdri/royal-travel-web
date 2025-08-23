/* ===== Royal Travel — YACHTS PAGE ===== */
(() => {
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const PAGE_SIZE = 9;

  const API = {
    yachts: (qs) => `${API_BASE}/api/yachts${qs ? `?${qs}` : ""}`,
  };

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const getParam = (k) => new URLSearchParams(location.search).get(k);
  const isAbs = (u) => /^https?:\/\//i.test(u);

  const mediaUrl = (m) => {
    if (!m) return "";
    const u = m?.sizes?.large?.url || m?.sizes?.medium?.url || m?.url || "";
    return u ? (isAbs(u) ? u : API_BASE + u) : "";
  };

  function fmtCurrency(n, ccy = "USD", locale = "en-US") {
    if (typeof n !== "number") return "Price on request";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: ccy === "IDR" ? 0 : 0,
      }).format(n);
    } catch {
      return "$" + (Math.round(n).toLocaleString("en-US") || n);
    }
  }

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  function buildWhereQS(dest, size, exp) {
    const params = new URLSearchParams();

    params.set("depth", "2"); // butuh object media (hero/gallery)
    params.set("limit", String(PAGE_SIZE));

    const page = Math.max(parseInt(getParam("page") || "1", 10) || 1, 1);
    params.set("page", String(page));

    // urutkan by name (bisa ganti: -startingPricePerDay)
    params.set("sort", "name");

    // Payload where builder
    const and = [];
    if (dest && dest !== "all") and.push({ destinations: { contains: dest } });
    if (size && size !== "all") and.push({ sizeClass: { equals: size } });
    if (exp && exp !== "all") and.push({ experiences: { contains: exp } });

    if (and.length === 1) params.set("where", JSON.stringify(and[0]));
    if (and.length > 1) params.set("where", JSON.stringify({ and }));

    return params.toString();
  }

  // ---------- UI renderers ----------
  function cardTemplate(y) {
    const img = y?.media?.hero || y?.media?.gallery?.[0]?.image;
    const imgSrc = mediaUrl(img) || "img/yachts/yacht-hero.jpg";

    const name = y?.name || "Luxury Yacht";
    const slug = y?.slug || "";
    const typeMap = {
      motor: "Motor Yacht",
      sailing: "Sailing Yacht",
      catamaran: "Catamaran",
      phinisi: "Traditional Phinisi",
    };
    const sizeMap = { small: "Small", medium: "Medium", large: "Large" };

    const typeLabel = typeMap[y?.type] || y?.type || "Yacht";
    const sizeLabel = sizeMap[y?.sizeClass] || "";
    const guests = y?.capacityGuests || y?.capacity || "-";
    const price =
      typeof y?.startingPricePerDay === "number"
        ? y.startingPricePerDay
        : typeof y?.starting_price === "number"
        ? y.starting_price
        : null;
    const priceText =
      price !== null ? `${fmtCurrency(price)} / day` : "Price on request";

    const destinations = Array.isArray(y?.destinations)
      ? y.destinations
          .map((d) =>
            d
              .replace("raja-ampat", "Raja Ampat")
              .replace("komodo", "Komodo")
              .replace("bali", "Bali")
          )
          .join(", ")
      : y?.island || "";

    return `
      <div class="col">
        <div class="yacht-card h-100 d-flex flex-column">
          <div class="yacht-thumb mb-3">
            <a href="yacht-detail.html?slug=${encodeURIComponent(slug)}">
              <img src="${imgSrc}" class="img-fluid rounded" alt="${name}">
            </a>
          </div>
          <div class="yacht-body flex-grow-1">
            <h3 class="yacht-name h5 mb-2">
              <a href="yacht-detail.html?slug=${encodeURIComponent(
                slug
              )}">${name}</a>
            </h3>
            <p class="yacht-meta mb-2">
              <i class="bi bi-rulers"></i> ${sizeLabel || "Size"} •
              <i class="bi bi-people"></i> Up to ${guests} guests •
              <i class="bi bi-water"></i> ${typeLabel}
            </p>
            <p class="yacht-dest text-muted mb-3">
              <i class="bi bi-geo-alt"></i> ${destinations || "-"}
            </p>
          </div>
          <div class="d-flex align-items-center justify-content-between mt-auto">
            <div class="yacht-price fw-semibold" style="color:#d3a478">${priceText}</div>
            <a class="btn_1" href="yacht-detail.html?slug=${encodeURIComponent(
              slug
            )}">View Details</a>
          </div>
        </div>
      </div>`;
  }

  function renderGrid(docs) {
    const grid = $(".yacht-grid");
    if (!grid) return;

    if (!Array.isArray(docs) || docs.length === 0) {
      grid.innerHTML =
        '<div class="col-12"><div class="alert alert-light text-center">No yachts match your filters.</div></div>';
      return;
    }
    grid.innerHTML = docs.map(cardTemplate).join("");
  }

  function renderPagination({ page, totalPages, totalDocs }) {
    const wrap = $(".pagination__wrapper");
    if (!wrap) return;

    if (!totalPages || totalPages <= 1) {
      wrap.innerHTML = "";
      return;
    }

    const cur = page || 1;
    const max = totalPages;
    const windowSize = 5;

    let start = Math.max(1, cur - Math.floor(windowSize / 2));
    let end = Math.min(max, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);

    let html = `<ul class="pagination justify-content-center">`;
    html += `<li class="page-item ${cur <= 1 ? "disabled" : ""}">
               <a class="page-link" data-page="${cur - 1}" href="#">Prev</a>
             </li>`;
    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === cur ? "active" : ""}">
                 <a class="page-link" data-page="${i}" href="#">${i}</a>
               </li>`;
    }
    html += `<li class="page-item ${cur >= max ? "disabled" : ""}">
               <a class="page-link" data-page="${cur + 1}" href="#">Next</a>
             </li>`;
    html += `</ul>`;

    wrap.innerHTML = html;

    wrap.addEventListener("click", (e) => {
      const a = e.target.closest("a.page-link");
      if (!a) return;
      e.preventDefault();

      const n = parseInt(a.getAttribute("data-page"), 10);
      if (!Number.isFinite(n)) return;

      const params = new URLSearchParams(location.search);
      params.set("page", String(Math.min(Math.max(n, 1), totalPages)));
      history.replaceState(
        {},
        "",
        `${location.pathname}?${params.toString()}#yachts`
      );
      load(); // reload daftar
      const anchor = $("#yachts");
      if (anchor)
        window.scrollTo({ top: anchor.offsetTop - 20, behavior: "smooth" });
    });
  }

  // ---------- filters ----------
  function applyFiltersFromUI() {
    const dest = $('.yacht-filter[data-filter="destination"]')?.value || "all";
    const size = $('.yacht-filter[data-filter="size"]')?.value || "all";
    const exp = $('.yacht-filter[data-filter="experience"]')?.value || "all";

    const params = new URLSearchParams(location.search);
    params.set("destination", dest);
    params.set("size", size);
    params.set("experience", exp);
    params.delete("page"); // reset ke page 1 saat filter berubah

    history.replaceState(
      {},
      "",
      `${location.pathname}?${params.toString()}#yachts`
    );
    load();
  }

  function syncUIFromParams() {
    const params = new URLSearchParams(location.search);
    const map = {
      destination: '.yacht-filter[data-filter="destination"]',
      size: '.yacht-filter[data-filter="size"]',
      experience: '.yacht-filter[data-filter="experience"]',
    };

    Object.entries(map).forEach(([k, sel]) => {
      const el = $(sel);
      if (!el) return;
      const v = params.get(k) || "all";
      if ([...el.options].some((o) => o.value === v)) el.value = v;
    });
  }

  // ---------- main loader ----------
  async function load() {
    try {
      const dest = getParam("destination") || "all";
      const size = getParam("size") || "all";
      const exp = getParam("experience") || "all";

      const qs = buildWhereQS(dest, size, exp);
      const data = await fetchJSON(API.yachts(qs));
      const docs = data?.docs || [];

      renderGrid(docs);
      renderPagination({
        page: data?.page || 1,
        totalPages: data?.totalPages || 1,
        totalDocs: data?.totalDocs ?? docs.length,
      });

      // re-init AOS jika dipakai
      if (window.AOS?.refresh) window.AOS.refresh();
    } catch (err) {
      console.error("Load yachts failed:", err);
      const grid = $(".yacht-grid");
      if (grid) {
        grid.innerHTML =
          '<div class="col-12"><div class="alert alert-danger text-center">Failed to load yachts. Please try again later.</div></div>';
      }
    }
  }

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    // hook filter selects
    $$(".yacht-filter").forEach((el) =>
      el.addEventListener("change", applyFiltersFromUI)
    );

    // Peta interaktif: tombol "Explore ..."
    $$(".interactive-map-container .map-point .learn-more").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const point = e.target.closest(".map-point");
        const dest = point?.dataset?.location;
        if (!dest) return;

        const destSelect = $('.yacht-filter[data-filter="destination"]');
        if (destSelect) destSelect.value = dest;

        const params = new URLSearchParams(location.search);
        params.set("destination", dest);
        params.delete("page");
        history.replaceState(
          {},
          "",
          `${location.pathname}?${params.toString()}#yachts`
        );
        load();
        const anchor = $("#yachts");
        if (anchor)
          window.scrollTo({ top: anchor.offsetTop - 20, behavior: "smooth" });
      });
    });

    // Suggested Journey: prefilter ke Raja Ampat + Adventure
    const journeyBtn = $("#viewYachtScheduleBtn");
    if (journeyBtn) {
      journeyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const destSel = $('.yacht-filter[data-filter="destination"]');
        const expSel = $('.yacht-filter[data-filter="experience"]');
        if (destSel) destSel.value = "raja-ampat";
        if (expSel) expSel.value = "adventure";

        const params = new URLSearchParams(location.search);
        params.set("destination", "raja-ampat");
        params.set("experience", "adventure");
        params.delete("page");
        history.replaceState(
          {},
          "",
          `${location.pathname}?${params.toString()}#yachts`
        );
        load();
        const anchor = $("#yachts");
        if (anchor)
          window.scrollTo({ top: anchor.offsetTop - 20, behavior: "smooth" });
      });
    }

    // sinkron UI dari URL lalu load data
    syncUIFromParams();
    load();
  });
})();
