/* Royal Travel — Golf Detail (dinamis dari Payload)
 * - Sumber data: /api/golf-courses (+ /api/golf-packages)
 * - Query: ?id=<id|slug> atau ?slug=<slug> atau ?course=<id|slug>
 * - Render: hero, overview (copywriting richText), details & highlights, gallery,
 *           pricing (golf-packages), facilities, map, Reserve Now CTA.
 */
(function ($) {
  "use strict";

  // ========= CONFIG =========
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const API = {
    courseById: (id) =>
      `${API_BASE}/api/golf-courses/${encodeURIComponent(id)}?depth=2`,
    courseBySlug: (slug) =>
      `${API_BASE}/api/golf-courses?where[slug][equals]=${encodeURIComponent(
        slug
      )}&depth=2&limit=1`,
    packagesByCourseId: (courseId, limit = 100) =>
      `${API_BASE}/api/golf-packages?where[parentCourse][equals]=${encodeURIComponent(
        courseId
      )}&limit=${limit}&sort=order`,
    mediaById: (id) =>
      `${API_BASE}/api/media/${encodeURIComponent(id)}?depth=0`,
  };

  // ========= UTILS =========
  const getParam = (k) => new URLSearchParams(location.search).get(k) || "";
  const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));

  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // Ambil URL media dari dokumen Payload (utamakan sizes → url)
  function mediaUrl(m) {
    if (!m) return "";
    // kalau string (kadang Payload menyimpan string path atau id)
    if (typeof m === "string") {
      // path langsung
      if (m.startsWith("/")) return API_BASE + encodeURI(m);
      // ID → biarkan pemanggil resolve manual bila butuh
      return m;
    }
    // dokumen media yang sudah populated
    const candidate =
      m?.sizes?.og?.url ||
      m?.sizes?.large?.url ||
      m?.sizes?.medium?.url ||
      m?.sizes?.small?.url ||
      m?.sizes?.square?.url ||
      m?.sizes?.thumbnail?.url ||
      m?.url ||
      "";
    if (!candidate) return "";
    return isAbs(candidate) ? candidate : API_BASE + encodeURI(candidate);
  }

  // Lexical richText (Payload) → HTML sederhana (paragraf)
  function lexicalToHTML(copy) {
    try {
      // Payload simpan di: { root: { children: [...] } }
      // tapi kita juga dukung kalau yang dikirim langsung "root"
      const rootNode = copy?.root ? copy.root : copy;
      const children = Array.isArray(rootNode?.children)
        ? rootNode.children
        : [];
      const out = [];

      const textOf = (nodes = []) =>
        nodes
          .map((n) =>
            n?.type === "text" && typeof n.text === "string" ? n.text : ""
          )
          .join("");

      for (const node of children) {
        switch (node?.type) {
          case "paragraph": {
            const t = textOf(node.children);
            if (t.trim()) out.push(`<p>${escapeHTML(t)}</p>`);
            break;
          }
          case "heading": {
            // dukung heading dari lexical (kadang pakai "tag", kadang "level")
            const tag =
              node.tag && /^h[1-6]$/.test(node.tag)
                ? node.tag
                : node.level
                ? `h${node.level}`
                : "h3";
            const t = textOf(node.children);
            if (t.trim()) out.push(`<${tag}>${escapeHTML(t)}</${tag}>`);
            break;
          }
          case "list": {
            const tag = node.listType === "number" ? "ol" : "ul";
            const items = (node.children || [])
              .map((li) => `<li>${escapeHTML(textOf(li.children || []))}</li>`)
              .join("");
            out.push(`<${tag}>${items}</${tag}>`);
            break;
          }
          // jika ada type lain, bisa ditambah case di sini
          default: {
            // fallback: kalau node punya children text, render sebagai paragraf
            const t = textOf(node?.children || []);
            if (t.trim()) out.push(`<p>${escapeHTML(t)}</p>`);
          }
        }
      }
      return out.join("");
    } catch {
      return "";
    }
  }

  function escapeHTML(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function tryCourseByIdThenSlug(ref) {
    // ref bisa id atau slug
    // coba id dulu
    try {
      const c = await fetchJSON(API.courseById(ref));
      if (c?.id) return c;
    } catch {}
    // lalu slug
    try {
      const cr = await fetchJSON(API.courseBySlug(ref));
      if (cr?.docs?.[0]) return cr.docs[0];
    } catch {}
    return null;
  }

  async function loadCourse() {
    const qId = getParam("id") || getParam("course");
    if (qId) {
      const c = await tryCourseByIdThenSlug(qId);
      if (c) return c;
    }
    const qSlug = getParam("slug");
    if (qSlug) {
      const cr = await fetchJSON(API.courseBySlug(qSlug));
      return cr?.docs?.[0] || null;
    }
    return null;
  }

  async function loadPackages(courseId) {
    if (!courseId) return [];
    try {
      const pr = await fetchJSON(API.packagesByCourseId(courseId));
      return Array.isArray(pr?.docs) ? pr.docs : [];
    } catch {
      return [];
    }
  }

  // ========= RENDER =========
  function renderHero(course) {
    const $hero = $(".golf-hero");
    if (!$hero.length) return;

    // ambil gambar hero dari media.hero (utamakan sizes og/large/medium) lalu fallback
    const heroSrc =
      mediaUrl(course?.media?.hero) ||
      mediaUrl(course?.media) ||
      "img/golf/golf-detail-hero.jpg";

    $hero.css("background-image", `url('${heroSrc}')`);

    const $content = $hero.find(".golf-hero-content");
    if ($content.length) {
      const title = course?.hero?.title || course?.name || "Golf Course";
      const tagline =
        course?.hero?.tagline ||
        "A Championship Golf Experience Amidst Natural Beauty";
      const locationText =
        course?.hero?.location || course?.island || "Indonesia";
      $content.html(
        `<p class="tagline">${escapeHTML(tagline)}</p>
         <h1>${escapeHTML(title)}</h1>
         <p class="location">${escapeHTML(locationText)}</p>`
      );
    }

    // animasi seperti sebelumnya
    setTimeout(
      () => $hero.find(".golf-hero-content").addClass("is-transitioned"),
      200
    );
  }

  function renderOverview(course) {
    const $section = $(".golf-overview");
    if (!$section.length) return;

    const $overviewText = $section.find(".overview-text");
    const $courseDetails = $section.find(".course-details");
    const $highlights = $section.find(".highlights-list");

    // --- Overview text (judul + richText) ---
    let richHTML = "";
    const cw = course?.overview?.copywriting;
    if (typeof cw === "string") {
      richHTML = `<p>${escapeHTML(cw)}</p>`;
    } else if (cw) {
      // dukung bentuk {root:{...}} atau langsung root object
      richHTML = lexicalToHTML(cw);
    }
    $overviewText.html(
      `<h2 style="color: var(--primary-color);">Overview</h2>${richHTML || ""}`
    );

    // --- Details (kiri) ---
    const d = course?.details || {};
    const tees = {
      black: d.blackTeesMeters,
      gold: d.goldTeesMeters,
      blue: d.blueTeesMeters,
      white: d.whiteTeesMeters,
      red: d.redTeesMeters,
    };
    $courseDetails.html(`
    <h4>Details</h4>
    <ul class="details-list">
      <li><strong>Grass Type:</strong> ${escapeHTML(d.grassType || "—")}</li>
      <li><strong>Tee Distances:</strong>
        <ul>
          <li>Black Tees: ${tees.black ?? "—"} meters</li>
          <li>Gold Tees: ${tees.gold ?? "—"} meters</li>
          <li>Blue Tees: ${tees.blue ?? "—"} meters</li>
          ${tees.white ? `<li>White Tees: ${tees.white} meters</li>` : ""}
          ${tees.red ? `<li>Red Tees: ${tees.red} meters</li>` : ""}
        </ul>
      </li>
      <li><strong>Golf Carts:</strong> ${escapeHTML(d.golfCarts || "—")}</li>
      <li><strong>Caddie Service:</strong> ${escapeHTML(
        d.caddieService || "—"
      )}</li>
      <li><strong>Tee Time Intervals:</strong> ${escapeHTML(
        d.teeTimeIntervals || "—"
      )}</li>
      <li><strong>Tee Time Policy:</strong> ${escapeHTML(
        d.teeTimePolicy || "—"
      )}</li>
      <li><strong>Dress Code:</strong> ${escapeHTML(d.dressCode || "—")}</li>
    </ul>
  `);

    // --- Highlights (kanan) ---
    const ov = course?.overview || {};
    const par = ov?.courseDetails?.par;
    const holes = ov?.courseDetails?.holes;
    $highlights.html(`
    <div class="highlight-card">
      <i class="bi bi-dot"></i>
      <div class="highlight-content">
        <h4>Course Designer</h4>
        <p>${escapeHTML(ov.designer || "—")}</p>
      </div>
    </div>
    <div class="highlight-card">
      <i class="bi bi-dot"></i>
      <div class="highlight-content">
        <h4>Course Details</h4>
        <p>${par ? `Par ${par}` : ""}${par && holes ? " | " : ""}${
      holes ? `${holes} holes` : ""
    }</p>
      </div>
    </div>
    <div class="highlight-card">
      <i class="bi bi-dot"></i>
      <div class="highlight-content">
        <h4>Difficulty Level</h4>
        <p>${
          (ov.difficultyLevel || "")
            .toString()
            .replace(/^\w/, (c) => c.toUpperCase()) || "—"
        }</p>
      </div>
    </div>
  `);
  }

  function renderFacilities(course) {
    const list = Array.isArray(course?.facilities) ? course.facilities : [];
    const $grid = $(".golf-experience .experience-grid");
    if (!$grid.length) return;
    if (!list.length) return;

    $grid.html(
      list
        .map(
          (f) => `
        <div class="experience-card">
          <i class="fas fa-check"></i>
          <h4>${escapeHTML(typeof f === "string" ? f : f?.facility || "")}</h4>
        </div>`
        )
        .join("")
    );
  }

  function renderGallery(course) {
    const $grid = $(".golf-gallery .gallery-grid");
    if (!$grid.length) return;

    const imgs = [];
    if (course?.media?.hero) imgs.push(mediaUrl(course.media.hero));
    (course?.media?.gallery || []).forEach((g) =>
      imgs.push(mediaUrl(g?.image || g))
    );
    const clean = imgs.filter(Boolean);

    if (!clean.length) {
      // biar section-nya tetap ada, tapi kosong (sesuai style)
      return;
    }

    $grid.html(
      clean
        .slice(0, 12)
        .map(
          (src, i) => `
        <div class="gallery-item">
          <img src="${src}" alt="${escapeHTML(
            course?.name || `Gallery ${i + 1}`
          )}" onerror="this.onerror=null;this.src='img/gallery/1.jpg';">
        </div>`
        )
        .join("")
    );
  }

  function unitLabel(u) {
    switch (u) {
      case "per_person":
        return "per person";
      case "per_hour":
        return "per hour";
      case "per_round":
        return "per round";
      case "per_group":
        return "per group";
      case "contact":
        return "Contact us";
      default:
        return "per person";
    }
  }

  function renderPricing(packages) {
    const $wrap = $(".golf-pricing .pricing-content");
    if (!$wrap.length) return;
    if (!Array.isArray(packages) || !packages.length) return;

    $wrap.html(
      packages
        .slice()
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .map((p) => {
          const price =
            p.unit === "contact" || p.price === undefined || p.price === null
              ? "Custom"
              : (p.currency || "USD") === "IDR"
              ? "Rp " + Number(p.price).toLocaleString("id-ID")
              : "$" + Number(p.price).toLocaleString("en-US");
          const unit = unitLabel(p.unit);
          return `
            <div class="pricing-row">
              <div>${escapeHTML(p.package || "Package")}${
            p.notes ? ` <small>(${escapeHTML(p.notes)})</small>` : ""
          }</div>
              <div>${price}</div>
              <div>${unit}</div>
            </div>`;
        })
        .join("")
    );
  }

  function renderMap(course) {
    const url = course?.map?.embedUrl || "";
    if (!url) return;
    const $iframe = $(".golf-location .map-container iframe");
    if ($iframe.length) {
      $iframe.attr("src", url);
    }
  }

  function wireReserveNow(course) {
    const $btn = $("#reserveNowLink");
    if (!$btn.length) return;
    const ref = course?.slug || course?.id;
    if (!ref) return;
    $btn.attr("href", `golf-booking.html?id=${encodeURIComponent(ref)}`);
  }

  // ========= BOOT =========
  $(async function () {
    try {
      const course = await loadCourse();
      if (!course) {
        console.error("[golf-detail] Course not found from URL params.");
        return;
      }

      // Render
      renderHero(course);
      renderOverview(course);
      renderFacilities(course);
      renderGallery(course);
      renderMap(course);
      wireReserveNow(course);

      // Pricing dari collection golf-packages
      const packs = await loadPackages(course.id);
      renderPricing(packs);
    } catch (err) {
      console.error("[golf-detail] load failed:", err);
    }

    // Newsletter kecil (kalau ada form)
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
  });
})(jQuery);
