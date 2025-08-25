/* ===== Royal Travel — JET BOOKING v2 (match current HTML) ===== */
(() => {
  const API_BASE = window.APP_CONFIG?.API_BASE || "";

  // ---------------- API builders ----------------
  const API = {
    charterBySlug: (slug) =>
      `${API_BASE}/api/jet-charters?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
    charterById: (id) => `${API_BASE}/api/jet-charters/${encodeURIComponent(id)}?depth=2`,
    jetById: (id) => `${API_BASE}/api/private-jets/${encodeURIComponent(id)}?depth=2`,
  };

  // ---------------- helpers ----------------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const getParam = (k) => new URLSearchParams(location.search).get(k);
  const isAbs = (u) => /^https?:\/\//i.test(u);
  const mediaUrl = (m) => {
    if (!m) return "";
    const u = m?.sizes?.large?.url || m?.sizes?.medium?.url || m?.url || "";
    return u ? (isAbs(u) ? u : API_BASE + u) : "";
  };
  const toCurrency = (n) =>
    typeof n === "number" && !Number.isNaN(n)
      ? "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : "-";
  const minutesToHhMm = (m) => {
    if (!m && m !== 0) return "";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h ? `${h}.${mm.toString().padStart(2, "0")}h` : `${mm}m`;
  };
  const mapType = (t) => {
    switch ((t || "").toLowerCase()) {
      case "light": return "Light Jet";
      case "midsize": return "Midsize Jet";
      case "heavy": return "Heavy Jet";
      case "ultra": return "Ultra Long Range";
      default: return t || "Private Jet";
    }
  };
  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // ---------------- state ----------------
  let jet = null;
  let charter = null;
  let hourlyRate = null;   // dari jet.startingPrice
  let charterPrice = null; // dari charter.price (flat charter)

  // ---------------- DOM setters (pakai elemen HTML yg sudah ada) ----------------
  function setHero(title, img) {
    const h1 = $(".hero h1");
    if (h1) h1.textContent = title || "Private Jet";
    const heroImg = $(".hero .jarallax-img");
    if (heroImg && img) heroImg.src = img;
  }

  function setRoute(r = {}) {
    // kolom kiri (inputs disabled di HTML, tetap bisa di-set .value)
    const dep = $("#departureAirport");
    const des = $("#destinationAirport");
    if (dep) dep.value = [r.fromCity, r.fromAirport, r.fromCode && `(${r.fromCode})`].filter(Boolean).join(" - ");
    if (des) des.value = [r.toCity, r.toAirport, r.toCode && `(${r.toCode})`].filter(Boolean).join(" - ");

    // panel kanan ringkas
    const summary = document.querySelector(".col-lg-4 .booking-container");
    if (summary) {
      const titleEl = summary.querySelector(".summary-item h5");
      const pEl = summary.querySelector(".summary-item p");
      const imgEl = summary.querySelector(".summary-item img");
      if (titleEl) titleEl.textContent = jet?.name || "Private Jet";
      if (pEl) pEl.textContent = `${r.fromCity || "-"} to ${r.toCity || "-"}${r.durationMinutes ? ` (${minutesToHhMm(r.durationMinutes)} flight)` : ""}`;
      if (imgEl) {
        const src = mediaUrl(jet?.media?.hero) || mediaUrl(charter?.media?.hero) || "img/gallery/1.jpg";
        imgEl.src = src;
        imgEl.alt = jet?.name || "Private Jet";
      }
    }
  }

  function setHoursFromRoute(r = {}) {
    const hoursInput = $("#flightHours");
    if (!hoursInput) return;
    if (typeof r.durationMinutes === "number") {
      const hours = Math.round((r.durationMinutes / 60) * 100) / 100;
      hoursInput.value = String(hours);
      const hoursValue = $("#hoursValue");
      if (hoursValue) hoursValue.textContent = hours;
    }
  }

  function calcExtras() {
    // ikut nama & harga dari HTML sekarang
    let extra = 0;
    if ($("#groundTransport")?.checked) extra += 350;
    if ($("#premiumCatering")?.checked) extra += 1200;
    if ($("#customizedWines")?.checked) extra += 800;
    if ($("#priorityHandling")?.checked) extra += 500;
    if ($("#dedicatedAttendant")?.checked) extra += 950;
    return extra;
  }

  function recalcAndRenderTotal() {
    const tripType = document.querySelector('input[name="tripType"]:checked')?.value || "one-way";
    const roundTrip = tripType === "round-trip";

    const hours = parseFloat($("#flightHours")?.value || "0") || 0;
    const baseRateEl = $("#baseRateValue");
    const hoursEl = $("#hoursValue");
    const subtotalEl = $("#charterSubtotalValue");
    const extrasEl = $("#additionalServicesValue");
    const taxesEl = $("#taxesValue");
    const totalEl = $("#totalValue");

    // Kalau ada charterPrice flat → pakai itu; kalau tidak, pakai hourlyRate × hours (×2 kalau round)
    let baseSubtotal = 0;
    if (typeof charterPrice === "number") {
      baseSubtotal = charterPrice;
      if (baseRateEl) baseRateEl.textContent = toCurrency(hourlyRate || 0) + "/hour";
      if (hoursEl) hoursEl.textContent = hours || "-";
    } else if (typeof hourlyRate === "number") {
      const legs = roundTrip ? 2 : 1;
      baseSubtotal = hourlyRate * hours * legs;
      if (baseRateEl) baseRateEl.textContent = toCurrency(hourlyRate) + "/hour";
      if (hoursEl) hoursEl.textContent = roundTrip ? `${hours * 2} (Round Trip)` : String(hours);
    } else {
      if (baseRateEl) baseRateEl.textContent = "Price on request";
      if (hoursEl) hoursEl.textContent = hours || "-";
    }

    const extras = calcExtras();
    const taxes = Math.round((baseSubtotal + extras) * 0.1);
    const total = baseSubtotal + extras + taxes;

    if (subtotalEl) subtotalEl.textContent = toCurrency(baseSubtotal);
    if (extrasEl) extrasEl.textContent = toCurrency(extras);
    if (taxesEl) taxesEl.textContent = toCurrency(taxes);
    if (totalEl) totalEl.textContent = toCurrency(total);
  }

  // Supaya “menang” dari script jQuery bawaanmu, panggil ulang setelah event standar
  function bindRecalcHooks() {
    const relisters = [
      "#departureDate", "#returnDate",
      "#departureTime", "#returnTime",
      "#passengerCount", "input[name='tripType']",
      "#groundTransport", "#premiumCatering", "#customizedWines",
      "#priorityHandling", "#dedicatedAttendant"
    ];
    relisters.forEach((sel) => {
      $$(sel).forEach((el) => {
        ["change", "input", "click"].forEach((evt) => {
          el.addEventListener(evt, () => setTimeout(recalcAndRenderTotal, 0));
        });
      });
    });

    // pertama kali
    setTimeout(recalcAndRenderTotal, 0);
  }

  // ---------------- loaders ----------------
  async function loadCharter(charterKey) {
    // coba slug dulu
    try {
      const cq = await fetchJSON(API.charterBySlug(charterKey));
      if (cq?.docs?.length) return cq.docs[0];
    } catch (e) {
      // ignore
    }
    // fallback ID
    try {
      return await fetchJSON(API.charterById(charterKey));
    } catch (e) {
      return null;
    }
  }

  async function init() {
    try {
      const key = getParam("charter");
      if (!key) {
        console.warn("No ?charter= in URL");
      } else {
        const c = await loadCharter(key);
        if (c) {
          charter = c;
          // parentJet bisa object (depth=2) atau ID string
          if (typeof c.parentJet === "object" && c.parentJet?.id) {
            jet = c.parentJet;
          } else if (typeof c.parentJet === "string") {
            try { jet = await fetchJSON(API.jetById(c.parentJet)); } catch {}
          }
        }
      }

      // Tarik angka-angka
      hourlyRate = jet?.startingPrice ?? null;   // $/hour
      charterPrice = charter?.price ?? null;     // flat charter price (one-way/round sesuai item)

      // Render hero, route, hours
      setHero(jet?.name || "Private Jet", mediaUrl(jet?.media?.hero) || mediaUrl(charter?.media?.hero));
      setRoute(charter?.route || {});
      setHoursFromRoute(charter?.route || {});

      // Tampilkan type/capacity di blok aircraft info kiri (judul + harga jam)
      const leftCard = document.querySelector(".jet-details .jet-option-item");
      if (leftCard) {
        const title = leftCard.querySelector(".jet-option-header h5");
        const price = leftCard.querySelector(".jet-option-header .jet-price");
        if (title) {
          const extras = [];
          if (jet?.type) extras.push(mapType(jet.type));
          if (typeof jet?.capacity === "number") extras.push(`${jet.capacity} pax`);
          title.textContent = [jet?.name || "Private Jet", extras.length ? `(${extras.join(" · ")})` : ""].join(" ").trim();
        }
        if (price && typeof hourlyRate === "number") {
          price.textContent = toCurrency(hourlyRate) + "/hour";
        }
      }

      // Hitung total pertama kali + pasang hooks
      bindRecalcHooks();

      // Anti “muncul setelah zoom”: paksa reflow ringan
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        document.body.offsetHeight;
      }, 50);
    } catch (err) {
      console.error("Error init booking:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
