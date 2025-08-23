/*
 * Royal Travel — Yacht Detail (dinamis dari Payload)
 * - Ambil yacht via ?yacht=<id|slug> / ?slug=<slug> / localStorage
 * - Render hero, key details, gallery, SCHEDULE (y.schedules), SPECIAL VOYAGES, PRIVATE EVENTS
 * - Render pricing (yacht-charters)
 */

(function ($) {
  "use strict";

  // ===== CONFIG =====
  const API_BASE = window.APP_CONFIG?.API_BASE || "";

  const API = {
    yachtBySlug: (slug) =>
      `${API_BASE}/api/yachts?where[slug][equals]=${encodeURIComponent(
        slug
      )}&depth=2&limit=1`,
    yachtById: (id) =>
      `${API_BASE}/api/yachts/${encodeURIComponent(id)}?depth=2`,
    chartersByYachtId: (yachtId, limit = 50) =>
      `${API_BASE}/api/yacht-charters?where[parentYacht][equals]=${encodeURIComponent(
        yachtId
      )}&depth=2&limit=${limit}`,
  };

  // ===== UTILS =====
  const getParam = (k) => new URLSearchParams(location.search).get(k) || "";
  const isAbs = (u) => /^https?:\/\//i.test(u);

  // --- ADD ---
  function wireBookingLinks(y) {
    const ref = y.slug || y.id;
    if (!ref) return;
    const bookUrl = `yacht-booking.html?yacht=${encodeURIComponent(ref)}`;

    // Tombol hero "Book This Yacht"
    $(".hero-section .btn_1.btn-lg").attr("href", bookUrl);

    // CTA di Special Voyages & Private Events (yang tadinya ke #booking_section)
    $("#special .voyage-details .btn_1").attr("href", bookUrl);
    $("#events .event-type-card .btn_1").attr("href", bookUrl);

    // Klik baris available di schedule → ke halaman booking
    $(document)
      .off("click.scheduleToBook")
      .on("click.scheduleToBook", ".schedule-table tr.available", function (e) {
        e.preventDefault();
        location.href = bookUrl;
      });
  }

  function mediaUrl(m) {
    if (!m) return "";
    const url =
      m?.sizes?.large?.url ||
      m?.sizes?.medium?.url ||
      m?.sizes?.card?.url ||
      m?.url ||
      (typeof m === "string" ? m : "");
    return url ? (isAbs(url) ? url : API_BASE + url) : "";
  }

  function fmtCurrency(
    n,
    ccy = "USD",
    locale = ccy === "IDR" ? "id-ID" : "en-US"
  ) {
    if (typeof n !== "number") return "";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: ccy === "IDR" ? 0 : 0,
      }).format(n);
    } catch {
      if (ccy === "IDR") return "Rp " + Number(n).toLocaleString("id-ID");
      return "$" + Number(n).toLocaleString();
    }
  }

  function fmtRange(a, b) {
    const s = new Date(a),
      e = new Date(b);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dd = (d) => d.toLocaleDateString(undefined, { day: "numeric" });
    const mon = (d) => months[d.getMonth()];
    const yy = (d) => d.getFullYear();
    const sameMonth =
      s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    return sameMonth
      ? `${mon(s)} ${dd(s)}–${dd(e)}, ${yy(s)}`
      : `${mon(s)} ${dd(s)}, ${yy(s)} – ${mon(e)} ${dd(e)}, ${yy(e)}`;
  }

  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // ===== DATA LOADERS =====
  async function tryByIdThenSlug(ref) {
    try {
      const yr = await fetchJSON(API.yachtById(ref));
      if (yr?.id) return yr;
    } catch {}
    try {
      const jr = await fetchJSON(API.yachtBySlug(ref));
      if (jr?.docs?.[0]) return jr.docs[0];
    } catch {}
    return null;
  }

  async function loadYacht() {
    const qy = getParam("yacht");
    if (qy) {
      const y = await tryByIdThenSlug(qy);
      if (y) return y;
    }
    const qs = getParam("slug");
    if (qs) {
      const jr = await fetchJSON(API.yachtBySlug(qs));
      return jr?.docs?.[0] || null;
    }
    const hint = localStorage.getItem("rt_yacht_ref") || "";
    if (hint) return await tryByIdThenSlug(hint);
    return null;
  }

  async function loadCharters(yachtId) {
    if (!yachtId) return [];
    try {
      const cr = await fetchJSON(API.chartersByYachtId(yachtId));
      return Array.isArray(cr?.docs) ? cr.docs : [];
    } catch {
      return [];
    }
  }

  // ===== RENDER =====
  function renderHero(y) {
    if (!y) return;
    const title = y.name || "Luxury Yacht";
    const tagline =
      y.tagline ||
      y.short_description ||
      (typeof y.overview === "string" ? y.overview : "") ||
      "Sail in Ultimate Luxury Through Paradise";
    const heroImg =
      mediaUrl(y?.media?.hero) ||
      mediaUrl(y?.image) ||
      mediaUrl(y?.thumbnail) ||
      "img/yachts/yacht-hero.jpg";

    $(".yacht-title").text(title);
    $(".yacht-tagline").text(
      String(tagline)
        .replace(/<[^>]*>/g, "")
        .trim()
        .slice(0, 140)
    );
    $(".hero-section").css("background-image", `url('${heroImg}')`);
  }

  function renderKeyDetails(y) {
    if (!y) return;
    const type = y.type || "—";
    const lengthM = typeof y.lengthMeters === "number" ? y.lengthMeters : null;
    const sizeFromClass =
      y.sizeClass === "large"
        ? "Superyacht"
        : y.sizeClass === "medium"
        ? "Mid-size Yacht"
        : y.sizeClass === "small"
        ? "Small Yacht"
        : y.size || "";
    const sizeLabel = [
      lengthM ? `${lengthM}m` : "",
      y.sizeLabel || sizeFromClass,
    ]
      .filter(Boolean)
      .join(" ");
    const capacity =
      typeof y.capacity === "number"
        ? y.capacity
        : typeof y.maxGuests === "number"
        ? y.maxGuests
        : y.guests;
    const cabins =
      typeof y.cabins === "number"
        ? `${y.cabins} Luxury Suites`
        : y.cabins || "—";
    const crew =
      y.crew ||
      (Array.isArray(y.crews) ? y.crews.join(", ") : null) ||
      (typeof y.crewCount === "number" ? `${y.crewCount} crew` : "—");
    const featuresArr =
      (Array.isArray(y.features) && y.features) ||
      (Array.isArray(y.amenities) && y.amenities) ||
      [];
    const features = featuresArr
      .map((f) =>
        typeof f === "string" ? f : f?.item || f?.name || f?.label || ""
      )
      .filter(Boolean)
      .join(", ");

    const $items = $(".key-details-card .details-list li");
    $items
      .eq(0)
      .find(".detail-info")
      .text(type || "—");
    $items
      .eq(1)
      .find(".detail-info")
      .text(sizeLabel || "—");
    $items
      .eq(2)
      .find(".detail-info")
      .text(capacity ? `Up to ${capacity} guests` : "—");
    $items
      .eq(3)
      .find(".detail-info")
      .text(cabins || "—");
    $items
      .eq(4)
      .find(".detail-info")
      .text(crew || "—");
    $items
      .eq(5)
      .find(".detail-info")
      .text(features || "—");
  }

  function renderGallery(y, charters) {
    const imgs = [];
    if (y?.media?.hero) imgs.push(mediaUrl(y.media.hero));
    (y?.media?.gallery || []).forEach((g) => imgs.push(mediaUrl(g.image || g)));
    (charters || []).forEach((c) =>
      (c?.media?.gallery || []).forEach((g) =>
        imgs.push(mediaUrl(g.image || g))
      )
    );
    const clean = imgs.filter(Boolean);
    if (!clean.length) return;
    const $grid = $(".gallery-grid");
    if (!$grid.length) return;
    const labels = [
      "Exterior View",
      "Main Lounge",
      "Dining Area",
      "Master Cabin",
      "Sundeck",
      "Jacuzzi",
    ];
    $grid.html(
      clean
        .slice(0, 6)
        .map(
          (src, i) => `
        <div class="col-lg-4 col-md-6 gallery-item" data-aos="zoom-in" data-aos-delay="${
          100 + i * 100
        }">
          <a href="${src}" class="gallery-link">
            <img src="${src}" alt="${
            labels[i] || y?.name || "Gallery"
          }" class="img-fluid">
            <div class="gallery-overlay"><i class="bi bi-plus-lg"></i><h4>${
              labels[i] || y?.name || "Gallery"
            }</h4></div>
          </a>
        </div>`
        )
        .join("")
    );
  }

  function renderPricing(charters) {
    const $tbody = $("#booking_section table tbody");
    if (!$tbody.length || !Array.isArray(charters) || !charters.length) return;
    $tbody.html(
      charters
        .slice()
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .map((c) => {
          const name = c.name || "Private Charter";
          const duration =
            (typeof c.durationDays === "number" && `${c.durationDays} Days`) ||
            (typeof c.durationHours === "number" &&
              `${c.durationHours} Hours`) ||
            c.duration ||
            "—";
          const includes =
            (Array.isArray(c.inclusions) ? c.inclusions : c.includes || [])
              .map((x) => (typeof x === "string" ? x : x?.item || ""))
              .filter(Boolean)
              .join(", ") || "—";
          const price =
            typeof c.price === "number"
              ? fmtCurrency(c.price, c.currency || "USD")
              : "—";
          return `<tr><td><strong>${name}</strong></td><td>${duration}</td><td>${includes}</td><td>${price}</td></tr>`;
        })
        .join("")
    );
  }

  // ===== SPECIAL VOYAGES =====
  function renderSpecialVoyages(y) {
    const list = Array.isArray(y?.specialVoyages) ? y.specialVoyages : [];
    const $wrap = $("#special .special-voyages");
    if (!$wrap.length || !list.length) return;

    const cards = list
      .slice()
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map((v) => {
        const img = mediaUrl(v.image);
        const range =
          v.startDate && v.endDate ? fmtRange(v.startDate, v.endDate) : "";
        const route = v.route || y.island || "";
        const spots =
          typeof v.spots === "number" ? `${v.spots} spots available` : "";
        const badge = v.badge
          ? `<span class="voyage-tag">${v.badge}</span>`
          : "";

        return `<div class="voyage-card col-lg-4 col-md-6">
          <div class="voyage-image">
            ${
              img
                ? `<img src="${img}" alt="${
                    v.title || "Special Voyage"
                  }" class="img-fluid">`
                : ""
            }
            ${badge}
          </div>
          <div class="voyage-details">
            <h4>${v.title || "Special Voyage"}</h4>
            <div class="voyage-info">
              ${
                range
                  ? `<p><i class="bi bi-calendar-event"></i> ${range}</p>`
                  : ""
              }
              ${route ? `<p><i class="bi bi-geo-alt"></i> ${route}</p>` : ""}
              ${
                spots ? `<p><i class="bi bi-people-fill"></i> ${spots}</p>` : ""
              }
            </div>
            ${
              v.description
                ? `<p class="voyage-description">${v.description}</p>`
                : ""
            }
            <a href="#booking_section" class="btn_1">Reserve Now</a>
          </div>
        </div>`;
      })
      .join("");

    $wrap.html(cards);
  }

  // ===== PRIVATE EVENTS =====
  function iconClass(name) {
    const n = String(name || "")
      .trim()
      .toLowerCase();
    const map = {
      heart: "bi-heart",
      wedding: "bi-heart",
      briefcase: "bi-briefcase",
      corporate: "bi-briefcase",
      gift: "bi-gift",
      party: "bi-balloon",
      star: "bi-star",
      calendar: "bi-calendar-event",
    };
    return map[n] || (n ? `bi-${n}` : "bi-heart");
  }

  function renderPrivateEvents(y) {
    const list = Array.isArray(y?.privateEvents) ? y.privateEvents : [];
    const $row = $("#events .events-content .row");
    if (!$row.length || !list.length) return;

    const cards = list
      .map((ev) => {
        const icon = iconClass(ev.icon);
        const feats = (Array.isArray(ev.features) ? ev.features : [])
          .map(
            (f) =>
              `<li><i class="bi bi-check-circle"></i> ${
                typeof f === "string" ? f : f?.item || ""
              }</li>`
          )
          .join("");

        return `<div class="col-md-6 col-lg-4">
          <div class="event-type-card">
            <div class="event-icon"><i class="bi ${icon}"></i></div>
            <h4>${ev.title || "Private Event"}</h4>
            ${ev.description ? `<p>${ev.description}</p>` : ""}
            ${feats ? `<ul class="event-features">${feats}</ul>` : ""}
            <a href="#booking_section" class="btn_1">Inquire Now</a>
          </div>
        </div>`;
      })
      .join("");

    $row.html(cards);
  }

  // ====== SCHEDULE ======
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const state = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    schedules: [],
  };

  function bindScheduleNav() {
    const prev = document.querySelector(".prev-month");
    const next = document.querySelector(".next-month");
    // Matikan onclick inline agar tidak bentrok
    if (prev) prev.setAttribute("onclick", "");
    if (next) next.setAttribute("onclick", "");

    if (prev)
      prev.addEventListener("click", (e) => {
        e.preventDefault();
        const now = new Date();
        if (state.year === now.getFullYear() && state.month === now.getMonth())
          return;
        state.month--;
        if (state.month < 0) {
          state.month = 11;
          state.year--;
        }
        refreshSchedule();
      });
    if (next)
      next.addEventListener("click", (e) => {
        e.preventDefault();
        const max = new Date();
        max.setFullYear(max.getFullYear() + 2);
        const nextStart = new Date(state.year, state.month + 1, 1);
        if (nextStart > max) return;
        state.month++;
        if (state.month > 11) {
          state.month = 0;
          state.year++;
        }
        refreshSchedule();
      });
  }

  function refreshSchedule() {
    $(".current-month").text(`${months[state.month]} ${state.year}`);
    const $tbody = $(".schedule-table tbody");
    if (!$tbody.length) return;

    const startBound = new Date(state.year, state.month, 1).getTime();
    const endBound = new Date(
      state.year,
      state.month + 1,
      0,
      23,
      59,
      59,
      999
    ).getTime();

    const rows = (state.schedules || [])
      .filter((ev) => {
        const s = new Date(ev.startDate).getTime();
        const e = new Date(ev.endDate).getTime();
        return !isNaN(s) && !isNaN(e) && s <= endBound && e >= startBound;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .map((ev) => {
        const cls =
          ev.status === "reserved"
            ? "booked"
            : ev.status === "maintenance"
            ? "maintenance"
            : "available";
        const badge =
          ev.status === "reserved"
            ? "Reserved"
            : ev.status === "maintenance"
            ? "Maintenance"
            : "Available";
        return `
          <tr class="${cls}">
            <td>${fmtRange(ev.startDate, ev.endDate)}</td>
            <td><span class="status-badge ${cls}">${badge}</span></td>
            <td>${ev.route || "—"}</td>
          </tr>`;
      });

    $tbody.html(
      rows.length
        ? rows.join("")
        : `<tr><td colspan="3">No schedules for this month.</td></tr>`
    );
  }

  // klik baris available → scroll ke pricing
  function initScheduleRowClick() {
    $(document).on("click", ".schedule-table tr.available", function () {
      const $target = $("#booking_section");
      if ($target.length)
        $("html, body").animate({ scrollTop: $target.offset().top - 100 }, 700);
    });
  }

  function initAOS() {
    if (window.AOS?.init)
      AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }

  // ===== BOOT =====
  $(async function () {
    initAOS();
    initScheduleRowClick();
    bindScheduleNav();

    try {
      const yacht = await loadYacht();
      if (!yacht) return;

      // simpan hint
      try {
        localStorage.setItem("rt_yacht_ref", yacht.slug || yacht.id || "");
      } catch {}

      // SCHEDULE dari dokumen yacht
      state.schedules = Array.isArray(yacht.schedules) ? yacht.schedules : [];
      refreshSchedule();

      const charters = await loadCharters(yacht.id);

      renderHero(yacht);
      renderKeyDetails(yacht);
      renderGallery(yacht, charters);
      renderSpecialVoyages(yacht); // <-- NEW
      renderPrivateEvents(yacht); // <-- NEW
      renderPricing(charters);

      wireBookingLinks(yacht);
    } catch (err) {
      console.error("[yacht-detail] load failed:", err);
    }

    // Newsletter (kalau form ada)
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
