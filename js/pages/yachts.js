/*
 * Royal Travel — Yachts Listing (uses old .box_grid card)
 * - Fetch from Payload /api/yachts (fallback ke window.YACHTS)
 * - Filters: Destination / Size / Experience
 * - Pagination
 * - Klik card/link -> menuju yacht-detail.html?slug=<slug>
 */

(function ($) {
  "use strict";

  // =========== CONFIG ===========
  const API_BASE = window.APP_CONFIG?.API_BASE || "";

  const API = {
    yachts: (qs = "") => `${API_BASE}/api/yachts${qs}`,
  };

  // =========== UTILS ===========
  // Mirip toSlug server-side: lower, strict, locale id
  const toSlug = (s) =>
    (s || "")
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  function isAbs(url) {
    return /^https?:\/\//i.test(url);
  }

  function mediaUrl(m) {
    if (!m) return "";
    const url =
      m?.sizes?.large?.url ||
      m?.sizes?.medium?.url ||
      m?.sizes?.card?.url ||
      m?.url ||
      (typeof m === "string" ? m : "");
    if (!url) return "";
    return isAbs(url) ? url : (API_BASE ? API_BASE + url : url);
  }

  function fmtCurrency(n, ccy = "USD", locale = "en-US") {
    if (typeof n !== "number") return "";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: ccy === "IDR" ? 0 : 0,
      }).format(n);
    } catch {
      if (ccy === "IDR") return "Rp " + n.toLocaleString("id-ID");
      if (ccy === "EUR") return "€" + n.toLocaleString();
      return "$" + n.toLocaleString();
    }
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // =========== LISTING ===========
  const Listing = (() => {
    const sel = {
      grid: ".yacht-grid",
      pagination: ".pagination__wrapper",
      filterDestination: '.yacht-filter[data-filter="destination"]',
      filterSize: '.yacht-filter[data-filter="size"]',
      filterExperience: '.yacht-filter[data-filter="experience"]',
    };

    const state = {
      all: [],
      filtered: [],
      page: 1,
      perPage: 9,
    };

    function onListingPage() {
      return document.querySelector(sel.grid);
    }

    async function loadAll() {
      const url = API.yachts("?limit=200&depth=1");
      try {
        const json = await fetchJSON(url);
        state.all = Array.isArray(json?.docs) ? json.docs : [];
      } catch (e) {
        console.warn("[yachts] fetch gagal, gunakan window.YACHTS bila ada:", e);
        state.all = Array.isArray(window.YACHTS) ? window.YACHTS : [];
      }
      state.page = 1;
    }

    function getFilters() {
      const dest = ($(sel.filterDestination).val() || "all").toString().toLowerCase();
      const size = ($(sel.filterSize).val() || "all").toString().toLowerCase();
      const exp = ($(sel.filterExperience).val() || "all").toString().toLowerCase();
      return { dest, size, exp };
    }

    function matchSize(y, size) {
      if (size === "all") return true;

      const sClass = (y.sizeClass || y.size || "").toLowerCase();
      if (sClass) return sClass === size;

      const L =
        typeof y.lengthMeters === "number"
          ? y.lengthMeters
          : typeof y.length_m === "number"
          ? y.length_m
          : null;
      if (L == null) return true;

      if (size === "small") return L <= 20;
      if (size === "medium") return L > 20 && L <= 35;
      if (size === "large") return L > 35;
      return true;
    }

    function matchExperience(y, exp) {
      if (exp === "all") return true;
      const arr =
        (Array.isArray(y.experiences) && y.experiences) ||
        (Array.isArray(y.tags) && y.tags) ||
        [];
      return arr.map((s) => String(s).toLowerCase()).includes(exp);
    }

    function applyFilters() {
      const { dest, size, exp } = getFilters();
      state.filtered = state.all.filter((y) => {
        const island = (y.island || y.destination || "").toLowerCase();
        const okDest = dest === "all" ? true : island.includes(dest);
        const okSize = matchSize(y, size);
        const okExp = matchExperience(y, exp);
        return okDest && okSize && okExp;
      });
      state.page = 1;
    }

    function paged() {
      const start = (state.page - 1) * state.perPage;
      return state.filtered.slice(start, start + state.perPage);
    }

    // --- Card mengikuti komponen lama (.box_grid)
    function cardHTML(y) {
      const title = y.name || "Luxury Yacht";
      const island = y.island || y.destination || "Indonesia";
      const type = y.type || "Luxury Yacht";

      const length =
        typeof y.lengthMeters === "number"
          ? `${y.lengthMeters} m`
          : typeof y.length_m === "number"
          ? `${y.length_m} m`
          : "";

      const capacity =
        typeof y.capacity === "number" ? y.capacity : y.maxGuests || y.guests || null;

      const short =
        (y.short_description || y.overview || "")
          .toString()
          .replace(/<[^>]*>/g, "")
          .trim() || "";
      const desc = short.length > 120 ? short.slice(0, 120).trim() + "…" : short;

      const priceNumber =
        typeof y.starting_price === "number" ? y.starting_price : null;
      const priceHtml = priceNumber
        ? `<div class="price"><strong>${fmtCurrency(
            priceNumber,
            y.currency || "USD"
          )}</strong><span>starting</span></div>`
        : "";

      const img =
        mediaUrl(y?.media?.hero) ||
        mediaUrl(y?.image) ||
        mediaUrl(y?.thumbnail) ||
        "img/yachts/yacht-hero.jpg";

      // === TARGET URL: selalu pakai slug ===
      const slug =
        (y.slug && String(y.slug).trim()) ||
        toSlug(y.name || "") ||
        ""; // usahakan selalu terisi
      // Jika slug kosong (sangat jarang), tetap arahkan ke detail tanpa param (fallback)

    //   console.log(`yacht-detail.html?slug=${encodeURIComponent(slug)}`)
      const toDetail = slug
        ? `yacht-detail.html?slug=${encodeURIComponent(slug)}`
        : `yacht-detail.html`;
      const toBook = slug
        ? `yacht-booking.html?slug=${encodeURIComponent(slug)}`
        : `yacht-booking.html`;

        console.log(toDetail)

      return `
        <div class="col">
          <div class="box_grid y-card" data-link="${toDetail}" data-slug="${slug}" tabindex="0">
            <figure>
              <a href="${toDetail}" class="y-card-link no-nav" data-slug="${slug}" aria-label="${title} details"></a>
              <img src="${img}" class="img-fluid" alt="${title}">
              ${priceHtml}
            </figure>
            <div class="wrapper">
              <small>${island}</small>
              <h3>${title}</h3>
              <p>${desc}</p>
              <div class="d-flex flex-wrap gap-2 mt-2">
                ${length ? `<span class="badge bg-light text-dark"><i class="bi bi-rulers"></i> ${length}</span>` : ""}
                ${
                  capacity
                    ? `<span class="badge bg-light text-dark"><i class="bi bi-people-fill"></i> ${capacity} guests</span>`
                    : ""
                }
                <span class="badge bg-light text-dark"><i class="bi bi-water"></i> ${type}</span>
              </div>
            </div>
            <ul>
              <li><i class="bi bi-geo-alt"></i> ${island}</li>
              <li><i class="bi bi-ship"></i> ${type}</li>
              <li>
                <a href="${toDetail}" class="btn_1 no-nav" data-slug="${slug}">Details</a>
                <a href="${toBook}" class="btn_2 no-nav" data-slug="${slug}" style="margin-left:8px;">Book</a>
              </li>
            </ul>
          </div>
        </div>
      `;
    }

    function renderGrid() {
      const $grid = $(sel.grid);
      if (!$grid.length) return;

      const html = paged().map(cardHTML).join("");
      $grid.html(html || `<div class="col"><p>No yachts found.</p></div>`);

      // seluruh card clickable, kecuali klik pada <a> / button internal
      $grid
        .off("click.ycard")
        .on("click.ycard", ".y-card", function (e) {
          if ($(e.target).closest("a,button,.no-nav").length) return;
          const url = $(this).data("link");
          if (url) window.location.href = url;
        });

      // jaga-jaga: pastikan a.no-nav selalu pakai slug terbaru
      $grid
        .off("click.ylinks")
        .on("click.ylinks", "a.no-nav", function () {
          const s = $(this).data("slug");
          if (s) {
            if (this.href.includes("yacht-booking.html")) {
              this.href = `yacht-booking.html?slug=${encodeURIComponent(s)}`;
            } else {
              this.href = `yacht-detail.html?slug=${encodeURIComponent(s)}`;
            }
          }
        });

      // akses keyboard (Enter / Space)
      $grid
        .off("keydown.ycard")
        .on("keydown.ycard", ".y-card", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const url = $(this).data("link");
            if (url) window.location.href = url;
          }
        });
    }

    function renderPagination() {
      const $wrap = $(sel.pagination);
      if (!$wrap.length) return;

      const total = state.filtered.length;
      const pages = Math.ceil(total / state.perPage) || 1;

      if (pages <= 1) {
        $wrap.empty();
        return;
      }

      const btns = [];
      for (let p = 1; p <= pages; p++) {
        btns.push(
          `<li class="${p === state.page ? "active" : ""}">
            <a href="#" data-page="${p}">${p}</a>
          </li>`
        );
      }
      $wrap.html(`<ul class="pagination">${btns.join("")}</ul>`);

      $wrap.off("click.pg").on("click.pg", "a[data-page]", function (e) {
        e.preventDefault();
        const p = parseInt($(this).data("page"), 10) || 1;
        state.page = p;
        renderGrid();
        renderPagination();
        $("html, body").animate({ scrollTop: $(sel.grid).offset().top - 80 }, 400);
      });
    }

    function bindFilters() {
      $(sel.filterDestination + "," + sel.filterSize + "," + sel.filterExperience)
        .off("change.yfilter")
        .on("change.yfilter", () => {
          applyFilters();
          renderGrid();
          renderPagination();
        });
    }

    async function boot() {
      if (!onListingPage()) return;
      await loadAll();
      applyFilters();
      renderGrid();
      renderPagination();
      bindFilters();
    }

    return { boot };
  })();

  // =========== SAFE ENHANCERS ===========
  function initAOS() {
    if (window.AOS?.init) {
      AOS.init({ duration: 800, easing: "ease-in-out", once: true, mirror: false });
    }
  }

  // BOOT
  $(function () {
    Listing.boot();
    initAOS();

    // Newsletter guard (kalau form ada)
    $("#newsletter_form").on("submit", function (e) {
      e.preventDefault();
      const email = $("#email_newsletter").val();
      $("#message-newsletter").html(
        email
          ? '<div class="alert alert-success">Thank you for subscribing!</div>'
          : '<div class="alert alert-danger">Please enter your email</div>'
      );
      if (email) $(this).trigger("reset");
    });

    // Hindari error autoplay video di hero (benign)
    const v = document.getElementById("video_home");
    if (v && typeof v.play === "function") {
      v.play().catch(() => {});
    }
  });
})(jQuery);
