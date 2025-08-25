/* ===== Royal Travel — JETS LIST ===== */
(() => {
  const API_BASE = window.APP_CONFIG?.API_BASE || ""; // sesuaikan dengan host Payload CMS
  const JETS_ENDPOINT = `${API_BASE}/api/private-jets?depth=1`;

  // Helpers DOM
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Media URL helper
  const isAbs = (u) => /^https?:\/\//i.test(u);
  const mediaUrl = (m) => {
    if (!m) return "img/hero_home_2.jpg"; // fallback
    const u = m?.sizes?.medium?.url || m?.url || "";
    return u ? (isAbs(u) ? u : API_BASE + u) : "img/hero_home_2.jpg";
  };

  const currency = (n) =>
    n == null ? "" : "$" + Number(n).toLocaleString("en-US");

  // State
  let jets = [];
  let typeFilter = "all"; // 'all' | 'light' | 'midsize' | 'heavy' | 'ultra'
  let paxFilter = null; // number | null

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // Hilangkan efek "tersembunyi sampai scroll/zoom"
  function forceReveal(root = document) {
    $$(".jet-card,[data-cue]", root).forEach((el) => {
      el.classList.add("slide-animated");
      el.style.opacity = "1";
      el.style.visibility = "visible";
      el.style.transform = "none";
    });
  }

  function renderEmpty(grid) {
    grid.innerHTML = `
      <div class="row">
        <div class="col-12 text-center">
          <p class="text-muted">
            Our jet collection is currently being curated. 
            Check back soon for our exclusive private jet options.
          </p>
        </div>
      </div>
    `;
  }

  function renderJets(list) {
    const grid = $("#jetsGrid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!list.length) {
      renderEmpty(grid);
      return;
    }

    // Render 3 per baris (kolom md-4)
    list.forEach((jet, idx) => {
      if (idx % 3 === 0) {
        grid.insertAdjacentHTML("beforeend", `<div class="row"></div>`);
      }
      const row = grid.lastElementChild;

      // normalisasi type
      const t = String(jet.type || "")
        .toLowerCase()
        .trim();
      const typeValue =
        ["light", "midsize", "heavy", "ultra"].find((k) => t.includes(k)) ||
        t ||
        "unknown";

      const capacity = Number(jet.capacity ?? 0) || null;

      row.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-md-4" data-cue="slideInUp">
          <div class="jet-card" data-type="${typeValue}" data-capacity="${
          capacity ?? ""
        }">
            <a href="jets-detail.html?slug=${encodeURIComponent(
              jet.slug || ""
            )}">
              <img src="${mediaUrl(jet.media?.hero)}" alt="${
          jet.name || "Private Jet"
        }">
            </a>
            <div class="jet-card-body">
              <h3 class="jet-card-title">${jet.name || "-"}</h3>
              <div class="jet-card-specs">
                <p><i class="bi bi-people-fill"></i> ${
                  capacity
                    ? `Up to ${capacity} passengers`
                    : jet.short_description || "Luxury private jet"
                }</p>
              </div>
              <div class="jet-card-price">
                ${
                  jet.startingPrice
                    ? `From ${currency(jet.startingPrice)} per hour`
                    : ""
                }
              </div>
              <a href="jets-detail.html?slug=${encodeURIComponent(
                jet.slug || ""
              )}" class="btn_1 outline">View Details</a>
            </div>
          </div>
        </div>`
      );
    });

    forceReveal(grid);
  }

  // Apply filter ke DOM tanpa rerender ulang data
  function applyFilters() {
    const cards = $$("#jetsGrid .jet-card");
    if (!cards.length) return;

    const wantType = String(typeFilter || "all").toLowerCase();
    const wantPax = paxFilter != null ? Number(paxFilter) : null;

    let shown = 0;

    cards.forEach((card) => {
      const cardType = (card.getAttribute("data-type") || "").toLowerCase();
      const capAttr = card.getAttribute("data-capacity");
      const cardCap = capAttr ? Number(capAttr) : null;

      // filter type
      const passType = wantType === "all" ? true : cardType.includes(wantType);

      // filter pax (hanya jika capacity ada & filter diisi)
      const passPax =
        wantPax == null ? true : cardCap ? cardCap >= wantPax : false;

      const ok = passType && passPax;

      card.parentElement.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    // kalau tidak ada yang lolos filter, tampilkan pesan kosong
    const grid = $("#jetsGrid");
    const emptyMarker = grid.querySelector(".rt-empty");
    if (shown === 0) {
      if (!emptyMarker) {
        const wrap = document.createElement("div");
        wrap.className = "row rt-empty";
        wrap.innerHTML = `
          <div class="col-12 text-center">
            <p class="text-muted">No jets match your filters. Try changing Aircraft Type or Passengers.</p>
          </div>`;
        grid.appendChild(wrap);
      }
    } else {
      if (emptyMarker) emptyMarker.remove();
    }

    forceReveal(grid);
  }

  // Sinkron filter tombol (All/Light/Midsize/Heavy)
  function bindTypeButtons() {
    $$(".search-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // UI state
        $$(".search-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // ambil label & normalisasi
        const label = (btn.textContent || "").trim().toLowerCase();
        if (label.startsWith("all")) typeFilter = "all";
        else if (label.includes("light")) typeFilter = "light";
        else if (label.includes("midsize")) typeFilter = "midsize";
        else if (label.includes("heavy")) typeFilter = "heavy";
        else typeFilter = "all";

        // sinkronkan dengan select Aircraft Type (kalau ada)
        const selects = $$(".jet-search-form select");
        const typeSelect = selects[1]; // [0]=Destination, [1]=Aircraft Type (struktur HTML kamu)
        if (typeSelect) {
          const map = {
            all: "",
            light: "Light",
            midsize: "Midsize",
            heavy: "Heavy",
          };
          typeSelect.value = map[typeFilter] ?? "";
        }

        applyFilters();
      });
    });
  }

  // Sinkron form filter (Passengers & Aircraft Type)
  function bindSearchForm() {
    const form = $(".jet-search-form");
    if (!form) return;

    const selects = $$("select", form);
    const typeSelect = selects[1] || null; // [0]=Destination, [1]=Aircraft Type
    const paxInput = form.querySelector('input[name="passengers"], .qty');

    // Aircraft Type select
    if (typeSelect) {
      typeSelect.addEventListener("change", () => {
        const v = (typeSelect.value || "").toLowerCase();
        if (["light", "midsize", "heavy"].includes(v)) typeFilter = v;
        else typeFilter = "all";

        // set state tombol sesuai select
        const text = v
          ? v.charAt(0).toUpperCase() + v.slice(1) + " Jets"
          : "All";
        $$(".search-filter-btn").forEach((b) => {
          const same =
            (b.textContent || "").trim().toLowerCase() ===
            (v ? `${v} jets` : "all");
          b.classList.toggle("active", same);
        });

        applyFilters();
      });
    }

    // Passengers (ketik manual)
    if (paxInput) {
      const updatePax = () => {
        const val = Number(
          (paxInput.value || "").toString().replace(/[^\d]/g, "")
        );
        paxFilter = Number.isFinite(val) && val > 0 ? val : null;
        applyFilters();
      };
      paxInput.addEventListener("change", updatePax);
      paxInput.addEventListener("input", updatePax);

      // tombol +/- sudah ada di theme; kita pantau klik pada container .qty-buttons
      const qtyWrap = form.querySelector(".qty-buttons");
      if (qtyWrap) {
        qtyWrap.addEventListener("click", (e) => {
          const t = e.target;
          if (!(t instanceof HTMLElement)) return;
          if (t.classList.contains("qtyplus") || t.value === "+") {
            const v = Number(paxInput.value || 0) + 1;
            paxInput.value = String(v);
            paxFilter = v;
            applyFilters();
          } else if (t.classList.contains("qtyminus") || t.value === "-") {
            const v = Math.max(1, Number(paxInput.value || 1) - 1);
            paxInput.value = String(v);
            paxFilter = v;
            applyFilters();
          }
        });
      }
    }

    // Submit form -> cuma mencegah reload & apply filter
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });
  }

  async function load() {
    const grid = $("#jetsGrid");
    if (!grid) return;

    // Loader ringan
    grid.innerHTML = `
      <div class="row">
        <div class="col-12 text-center">
          <p class="text-muted">Loading jets…</p>
        </div>
      </div>`;

    try {
      const data = await fetchJSON(JETS_ENDPOINT);
      jets = Array.isArray(data?.docs) ? data.docs : [];
      renderJets(jets);

      // Bind filter UI
      bindTypeButtons();
      bindSearchForm();

      // Inisialisasi filter awal: tombol "All" aktif
      const firstBtn = $(".search-filter-btn");
      if (firstBtn) firstBtn.classList.add("active");

      applyFilters();
    } catch (err) {
      console.error("Error load jets:", err);
      grid.innerHTML = `
        <div class="row">
          <div class="col-12 text-center">
            <p class="text-danger">Failed to load jets. Please try again later.</p>
          </div>
        </div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
