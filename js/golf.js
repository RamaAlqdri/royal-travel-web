// js/golf-data.js
(function ($) {
  "use strict";

  // ====== CONFIG API ======
  const API_BASE = window.APP_CONFIG?.API_BASE || "";

  const API = {
    courses: (limit = 200) => `${API_BASE}/api/golf-courses?depth=2&limit=${limit}&sort=-featured,-rating,createdAt`,
    packages: (limit = 1000) => `${API_BASE}/api/golf-packages?depth=0&limit=${limit}&sort=order,price`,
  };

  const currencySymbol = (ccy) => {
    const k = String(ccy || "USD").toUpperCase();
    if (k === "IDR") return "Rp ";
    if (k === "EUR") return "€";
    if (k === "GBP") return "£";
    if (k === "JPY") return "¥";
    return "$";
  };
  const fmt = (n, ccy) => {
    const loc = String(ccy).toUpperCase() === "IDR" ? "id-ID" : "en-US";
    return (Number(n) || 0).toLocaleString(loc);
  };

  const getParam = (k) => new URLSearchParams(location.search).get(k) || "";
  const isAbs = (u) => /^https?:\/\//i.test(u);
  const mediaUrl = (m) => {
    if (!m) return "";
    const url = m?.sizes?.large?.url || m?.sizes?.medium?.url || m?.sizes?.card?.url || m?.url || (typeof m === "string" ? m : "");
    return url ? (isAbs(url) ? url : API_BASE + url) : "";
  };

  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // ====== LOAD DATA ======
  async function loadAll() {
    const [cr, pr] = await Promise.all([fetchJSON(API.courses()), fetchJSON(API.packages())]);
    const courses = Array.isArray(cr?.docs) ? cr.docs : [];
    const packages = Array.isArray(pr?.docs) ? pr.docs : [];

    // group packages by parentCourse
    const pkgByCourse = new Map();
    for (const p of packages) {
      const key = typeof p.parentCourse === "string" ? p.parentCourse : p.parentCourse?.id;
      if (!key) continue;
      const arr = pkgByCourse.get(key) || [];
      arr.push(p);
      pkgByCourse.set(key, arr);
    }

    // enrich courses with minPrice
    const enriched = courses.map((c) => {
      const pkgs = pkgByCourse.get(c.id) || [];
      const sorted = pkgs.slice().sort((a, b) => (a.price ?? 9e15) - (b.price ?? 9e15));
      const cheapest = sorted[0];
      return {
        raw: c,
        id: c.id,
        slug: c.slug || c.id,
        name: c.name,
        island: (c.island || "").toLowerCase(),
        rating: Number(c.rating) || null,
        featured: !!c.featured,
        difficulty: c?.overview?.difficultyLevel || "",
        holes: c?.overview?.courseDetails?.holes || null,
        par: c?.overview?.courseDetails?.par || null,
        displayLoc: c?.hero?.location || c.island || "",
        heroImg: mediaUrl(c?.media?.hero) || mediaUrl(c?.media?.gallery?.[0]?.image) || "img/hero_home_1.jpg",
        minPrice: cheapest ? Number(cheapest.price) : null,
        currency: cheapest?.currency || "USD",
      };
    });

    return { courses: enriched, allPackages: packages };
  }

  // ====== RENDER HELPERS ======
  function tagForCourse(c) {
    if (c.featured) return "Featured";
    if ((c.rating || 0) >= 4.8) return "Top Rated";
    // "New" jika 60 hari terakhir
    const created = new Date(c.raw?.createdAt || 0);
    if (created && !isNaN(+created)) {
      const diff = (Date.now() - +created) / (1000 * 3600 * 24);
      if (diff <= 60) return "New";
    }
    return "";
  }

  function difficultyLabel(v) {
    if (v === "beginner") return "Beginner";
    if (v === "intermediate") return "Intermediate";
    if (v === "championship") return "Championship";
    return v || "";
    }

  function courseCard(c) {
    const tag = tagForCourse(c);
    const ratingHTML = c.rating
      ? `<div class="golf-result-rating"><div class="stars">${
          '★★★★★'.split('').map((_,i)=>`<i class="fas fa-star${i+1<=Math.floor(c.rating)?'':''}${i+1>c.rating&&i+1-Math.floor(c.rating)<=1&&c.rating%1>=0.5?'-half-alt':''}"></i>`).join('')
        }</div><span>${c.rating.toFixed(1)}</span></div>`
      : '';

    const priceHTML = c.minPrice != null
      ? `<div class="golf-result-price"><span class="price">${currencySymbol(c.currency)}${fmt(c.minPrice, c.currency)}</span><span class="unit">per person</span></div>`
      : `<div class="golf-result-price"><span class="price">Inquire</span><span class="unit">&nbsp;</span></div>`;

    return `
      <div class="col-lg-4 col-md-6">
        <div class="golf-result-card">
          <div class="golf-result-image">
            <img src="${c.heroImg}" alt="${c.name}">
            ${tag ? `<div class="golf-result-tag">${tag}</div>` : ''}
          </div>
          <div class="golf-result-content">
            ${ratingHTML}
            <h3>${c.name}</h3>
            <p class="golf-result-location"><i class="fas fa-map-marker-alt"></i> ${c.displayLoc}</p>
            <div class="golf-result-features">
              ${c.holes ? `<span><i class="fas fa-flag"></i> ${c.holes} Holes</span>` : ''}
              ${c.difficulty ? `<span><i class="fas fa-mountain"></i> ${difficultyLabel(c.difficulty)}</span>` : ''}
              ${c.par ? `<span><i class="fas fa-golf-ball"></i> Par ${c.par}</span>` : ''}
            </div>
            <div class="golf-result-footer">
              ${priceHTML}
              <a href="golf-detail.html?id=${encodeURIComponent(c.slug)}" class="btn-view">View Details</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  function destinationCard(c){
    return `
      <div class="col-lg-6 col-md-6">
        <div class="golf-course-card">
          <a href="golf-detail.html?id=${encodeURIComponent(c.slug)}">
            <img src="${c.heroImg}" alt="${c.name}" class="golf-course-image">
            <div class="golf-course-overlay">
              <h3>${c.name}</h3>
              <p>${c.raw?.overview?.copywriting ? ' ' : 'A signature championship course in a stunning setting.'}</p>
              <div class="golf-course-features">
                ${c.holes ? `<span><i class="fas fa-flag"></i> ${c.holes} Holes</span>` : ''}
                ${c.difficulty ? `<span><i class="fas fa-mountain"></i> ${difficultyLabel(c.difficulty)}</span>` : ''}
                <span><i class="fas fa-map-marker-alt"></i> ${c.displayLoc}</span>
              </div>
            </div>
          </a>
        </div>
      </div>`;
  }

  // ====== RENDER TO PAGE ======
  function renderDestinations(list){
    const $row = $("#golf-destinations .row").first();
    if (!$row.length) return;
    $row.empty().append(list.map(destinationCard).join("") || `<div class="col-12"><p>No courses yet.</p></div>`);
  }

  function renderResults(list){
    const $row = $(".golf-results .row").first();
    if (!$row.length) return;
    $row.empty().append(list.map(courseCard).join("") || `<div class="col-12"><p>No results.</p></div>`);
  }

  function renderPackages(pkgs, coursesById){
    const $row = $("#golf-packages .row").first();
    if (!$row.length) return;
    const pick = pkgs.slice(0, 6); // ambil 6 terbaru/termurah sesuai sort API
    const html = pick.map(p=>{
      const cId = typeof p.parentCourse === "string" ? p.parentCourse : p.parentCourse?.id;
      const c = coursesById.get(cId);
      const link = c ? `golf-detail.html?id=${encodeURIComponent(c.slug || c.id)}` : '#';
      const symbol = currencySymbol(p.currency || 'USD');
      return `
        <div class="col-lg-4 col-md-6">
          <div class="golf-result-card">
            <div class="golf-result-image">
              <img src="${c?.heroImg || 'img/hero_home_2.jpg'}" alt="${p.package}">
              <div class="golf-result-tag">Package</div>
            </div>
            <div class="golf-result-content">
              <h3>${p.package}</h3>
              <p class="golf-result-location"><i class="fas fa-map-marker-alt"></i> ${c?.name || 'Golf Course'}</p>
              <div class="golf-result-footer">
                <div class="golf-result-price">
                  <span class="price">${symbol}${fmt(p.price, p.currency)}</span>
                  <span class="unit">per person</span>
                </div>
                <a href="${link}" class="btn-view">View Details</a>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    $row.html(html || `<div class="col-12"><p>No packages yet.</p></div>`);
  }

  // ====== FILTERING ======
  function applyFilters(allCourses) {
    const loc = ($("#location-filter").val() || "").toString().toLowerCase();
    const diff = ($("select[name='difficulty']").val() || "").toString().toLowerCase();

    return allCourses.filter(c => {
      const okLoc = !loc || c.island === loc;
      const okDiff = !diff || (c.difficulty || "").toLowerCase() === diff;
      return okLoc && okDiff;
    });
  }

  // ====== INIT ======
  $(async function(){
    try {
      const { courses, allPackages } = await loadAll();

      // Build index for packages rendering
      const mapById = new Map(courses.map(c => [c.id, c]));

      // DESTINATIONS: ambil featured dulu, jika kurang ambil rating tertinggi
      const featured = courses.filter(c => c.featured);
      const topRated = courses
        .filter(c => !c.featured)
        .sort((a,b)=> (b.rating||0)-(a.rating||0));
      const destList = [...featured, ...topRated].slice(0, 4);
      renderDestinations(destList);

      // RESULTS awal
      renderResults(applyFilters(courses));

      // PACKAGES
      renderPackages(allPackages, mapById);

      // Hook filter UI
      $("#location-filter, select[name='difficulty']").on("change", function(){
        renderResults(applyFilters(courses));
      });

      // Optional: prefilter via URL ?location=bali&difficulty=championship
      const qLoc = getParam("location"); const qDiff = getParam("difficulty");
      if (qLoc) $("#location-filter").val(qLoc.toLowerCase()).trigger("change");
      if (qDiff) $("select[name='difficulty']").val(qDiff.toLowerCase()).trigger("change");
    } catch (e) {
      console.warn("[golf] load failed:", e);
    }
  });

})(jQuery);
