/* ===== Royal Travel — JET DETAIL PAGE ===== */
(() => {
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const API = {
    jetBySlug: (slug) =>
      `${API_BASE}/api/private-jets?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
    chartersByJetId: (jetId) =>
      `${API_BASE}/api/jet-charters?where[parentJet][equals]=${encodeURIComponent(jetId)}&depth=2&limit=10`,
    charterBySlug: (slug) =>
      `${API_BASE}/api/jet-charters?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
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
  const number = (n, locale = "en-US") =>
    typeof n === "number" ? n.toLocaleString(locale) : "";

  function fmtCurrency(n, ccy = "USD", locale = "en-US") {
    if (typeof n !== "number") return "";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: ccy === "IDR" ? 0 : 0,
      }).format(n);
    } catch {
      // fallback simple
      if (ccy === "IDR") return "Rp " + number(n, "id-ID");
      if (ccy === "EUR") return "€" + number(n);
      return "$" + number(n);
    }
  }

  const minutesToHhMm = (m) => {
    if (!m && m !== 0) return "";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h ? `${h}h ${mm}m` : `${mm}m`;
  };

  const ktsToMph = (kts) =>
    typeof kts === "number" ? Math.round(kts * 1.15078) : null;

  const mapType = (t) => {
    switch ((t || "").toLowerCase()) {
      case "light":
        return "Light Jet";
      case "midsize":
        return "Midsize Jet";
      case "heavy":
        return "Heavy Jet";
      case "ultra":
        return "Ultra Long Range";
      default:
        return t || "Private Jet";
    }
  };

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // ---------- renderers ----------
  function renderHero(jet) {
    const img = $(".hero .jarallax-img");
    const h1 = $(".hero h1");
    const lead = $(".hero .lead");

    if (img) img.src = mediaUrl(jet?.media?.hero) || "img/hero_home_2.jpg";
    if (h1) h1.textContent = jet?.name || "Private Jet";
    if (lead) {
      lead.textContent =
        jet?.short_description ||
        jet?.overview?.caption ||
        "Unmatched Comfort, Ultimate Privacy";
    }
  }

  function renderBooking(charter, jet) {
    const section = $("#booking_section");
    if (!section) return;

    if (!charter || !jet) {
      // sembunyikan jika tidak ada charter
      section.style.display = "none";
      return;
    }

    const r = charter.route || {};
    const fromCity = r.fromCity || "";
    const fromAirport = r.fromAirport || "";
    const fromCode = r.fromCode || "";
    const toCity = r.toCity || "";
    const toAirport = r.toAirport || "";
    const toCode = r.toCode || "";
    const duration = minutesToHhMm(r.durationMinutes);
    const passengersNote = `Up to ${jet.capacity || "-"} passengers`;
    const tripTypeLabel =
      (charter.tripType === "roundtrip" ? "Round-trip" : "One-way") +
      " | " +
      passengersNote;

    const priceText = fmtCurrency(charter.price, charter.currency || "USD");

    const inc = (charter.inclusions || []).map(
      (x) =>
        `<li><i class="bi bi-check-circle"></i> ${x.item || ""}</li>`
    );

    section.innerHTML = `
      <div class="container">
        <div class="title text-center">
          <small>Selected Flight</small>
          <h2>Your Journey Details</h2>
          <p class="lead">${fromCity || "—"} to ${toCity || "—"} | ${jet.name || ""}</p>
        </div>
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <div class="flight-detail-card">
              <div class="row">
                <div class="col-md-6">
                  <div class="flight-route">
                    <div class="departure">
                      <span class="city">${fromCity || "-"}</span>
                      <span class="airport">${fromAirport || ""}</span>
                      <span class="code">${fromCode || ""}</span>
                    </div>

                    <div class="flight-path">
                      <div class="path-line">
                        <span class="dot start"></span>
                        <span class="line"></span>
                        <span class="dot end"></span>
                      </div>
                      <div class="flight-info">
                        <span class="duration">${duration || "-"}</span>
                        <span class="plane-icon"><i class="bi bi-airplane"></i></span>
                      </div>
                    </div>

                    <div class="arrival">
                      <span class="city">${toCity || "-"}</span>
                      <span class="airport">${toAirport || ""}</span>
                      <span class="code">${toCode || ""}</span>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="flight-details">
                    <div class="price-detail">
                      <span class="label">Charter Price</span>
                      <span class="price">${priceText || "-"}</span>
                      <span class="note">${tripTypeLabel}</span>
                    </div>
                    <div class="flight-inclusions">
                      <h5>Package Includes:</h5>
                      <ul>${inc.join("")}</ul>
                    </div>
                    <a href="jet-booking.html?charter=${encodeURIComponent(
                      charter.slug || charter.id || ""
                    )}" class="btn_1 full-width mt-3">Proceed to Booking</a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderInfo(jet) {
    const section = $("#jet_information");
    if (!section) return;

    const range =
      (typeof jet.rangeKm === "number" && number(jet.rangeKm) + " km") ||
      (typeof jet.rangeNm === "number" && number(jet.rangeNm) + " NM") ||
      "-";

    const cabin = (jet.cabinFeatures || []).map((x) => x.feature).filter(Boolean);
    const crew = (jet.crew || []).map((x) => x.role).filter(Boolean);
    const inflight = (jet.inflightExperience || [])
      .map((x) => x.item)
      .filter(Boolean);

    const speedMph = ktsToMph(jet.cruiseSpeedKts);
    const speedText =
      typeof jet.cruiseSpeedKts === "number"
        ? `${number(speedMph)} mph`
        : "-";

    const altText =
      typeof jet.cruiseAltitudeFt === "number"
        ? `${number(jet.cruiseAltitudeFt)} ft`
        : "-";

    const titleSmall = jet.overview?.title || "Luxury Air Travel";
    const h2Title =
      jet.overview?.subtitle || "Experience Unparalleled Luxury";

    // konten kiri: gunakan short_description + caption jika ada
    const p1 =
      jet.short_description ||
      "Meticulously crafted to exceed your expectations.";
    const p2 =
      jet.overview?.caption ||
      "A spacious cabin designed for productivity and relaxation.";
    const p3 =
      "Our dedicated crew ensures personalized service on every flight.";

    section.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-lg-6">
            <div class="title">
              <small>${titleSmall}</small>
              <h2>${h2Title}</h2>
            </div>
            <p class="lead">${p1}</p>
            <p>${p2}</p>
            <p>${p3}</p>
          </div>

          <div class="col-lg-5 offset-lg-1">
            <div class="jet-details-card">
              <h3>Jet Specifications</h3>
              <ul class="jet-specs">
                <li><span>Type:</span> ${mapType(jet.type)}</li>
                <li><span>Range:</span> ${range}</li>
                <li><span>Seating Capacity:</span> Up to ${jet.capacity || "-"} passengers</li>
                <li><span>Cabin Features:</span> ${cabin.length ? cabin.join(", ") : "-"}</li>
                <li><span>Crew:</span> ${crew.length ? crew.join(", ") : "-"}</li>
                <li><span>Cruising Speed:</span> ${speedText}</li>
                <li><span>Cruising Altitude:</span> ${altText}</li>
                <li><span>In-Flight Experience:</span> ${inflight.length ? inflight.join(", ") : "-"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderGallery(jet, charter) {
    const section = $("#jet_gallery");
    if (!section) return;

    // kumpulkan gambar: hero + gallery jet + gallery charter (jika ada)
    const imgs = [];
    if (jet?.media?.hero) imgs.push({ image: jet.media.hero, caption: jet.name });
    (jet?.media?.gallery || []).forEach((g) => imgs.push(g));
    (charter?.media?.gallery || []).forEach((g) => imgs.push(g));

    if (!imgs.length) {
      section.style.display = "none";
      return;
    }

    const items = imgs.slice(0, 6).map((g, i) => {
      const href = mediaUrl(g.image || g);
      const thumb = href;
      const title = g.caption || jet?.name || "Gallery";
      const col =
        i === 3 || i === 4 ? "col-lg-6 col-md-6" : "col-lg-4 col-md-6";
      return `
        <div class="${col}">
          <a href="${href}" class="gallery-item" title="${title}">
            <img src="${thumb}" alt="${title}" class="img-fluid">
            <div class="gallery-overlay"><h4>${title}</h4></div>
          </a>
        </div>`;
    });

    section.innerHTML = `
      <div class="container">
        <div class="title text-center">
          <small>Visual Tour</small>
          <h2>Jet Gallery</h2>
          <p class="lead">Experience the luxury of ${jet?.name || "our jets"}</p>
        </div>
        <div class="grid-gallery">
          <div class="row g-3">
            ${items.join("")}
          </div>
        </div>
      </div>`;

    // Lightbox (Magnific Popup)
    if (window.jQuery) {
      jQuery(".grid-gallery").magnificPopup({
        delegate: "a.gallery-item",
        type: "image",
        gallery: { enabled: true },
      });
    }
  }

  // ---------- main loader ----------
  async function load() {
    try {
      const jetSlug = getParam("slug");
      const charterSlug = getParam("charter") || getParam("charterSlug");

      let jet = null;
      let charter = null;

      if (charterSlug) {
        // prioritas: buka charter tertentu (parentJet ikut ter-populate karena depth=2)
        const cj = await fetchJSON(API.charterBySlug(charterSlug));
        charter = cj?.docs?.[0] || null;
        jet = charter?.parentJet || null;
      } else if (jetSlug) {
        // buka jet, lalu cari charter pertama untuk display (opsional)
        const r = await fetchJSON(API.jetBySlug(jetSlug));
        jet = r?.docs?.[0] || null;

        if (jet?.id) {
          const rc = await fetchJSON(API.chartersByJetId(jet.id));
          charter = rc?.docs?.[0] || null;
        }
      }

      if (!jet && !charter) {
        console.warn("Jet/Charter not found.");
        // minimal: sembunyikan section dinamis
        const dyn = ["#booking_section", "#jet_information", "#jet_gallery"];
        dyn.forEach((sel) => {
          const el = $(sel);
          if (el) el.style.display = "none";
        });
        return;
      }

      // kalau charter ada tapi parentJet tidak ter-populate penuh (depth < 2),
      // fallback fetch jet by id
      if (!jet && charter?.parentJet) jet = charter.parentJet;

      // Render
      renderHero(jet || {});
      renderBooking(charter, jet || {});
      renderInfo(jet || {});
      renderGallery(jet || {}, charter || null);

      // bantu “reflow” supaya konten muncul tanpa harus zoom (beberapa tema butuh ini)
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        document.body.offsetHeight; // force reflow
      }, 50);
    } catch (err) {
      console.error("Error load jet detail:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
