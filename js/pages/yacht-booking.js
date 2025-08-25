// js/yacht-booking.js
(function ($) {
  "use strict";

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
      )}&depth=0&limit=${limit}`,
  };

  const getParam = (k) => new URLSearchParams(location.search).get(k) || "";
  const isAbs = (u) => /^https?:\/\//i.test(u);

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

  function currencySymbol(ccy) {
    if (ccy === "IDR") return "Rp ";
    if (ccy === "EUR") return "€";
    if (ccy === "GBP") return "£";
    return "$";
  }

  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  async function getYacht(ref) {
    // coba ID, lalu slug
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

  async function getCharters(yachtId) {
    const cr = await fetchJSON(API.chartersByYachtId(yachtId));
    return Array.isArray(cr?.docs) ? cr.docs : [];
  }

  function fillTopInfo(y) {
    const name = y?.name || "Luxury Yacht";
    const typeBits = [
      y?.type || "",
      typeof y?.lengthMeters === "number" ? `${y.lengthMeters}m` : "",
      y?.sizeLabel || "",
    ].filter(Boolean);
    const typeLabel = typeBits.join(" ").trim();
    const hero =
      mediaUrl(y?.media?.hero) ||
      mediaUrl(y?.image) ||
      mediaUrl(y?.thumbnail) ||
      "img/yachts/yacht-hero.jpg";

    $(".hero .slide-animated.two").text(name);
    const tagline =
      y?.tagline ||
      y?.short_description ||
      "Complete your yacht charter booking details";
    $(".hero .slide-animated.three").text(
      String(tagline)
        .replace(/<[^>]*>/g, "")
        .trim()
    );
    $(".jarallax-img").attr("src", hero);

    $("#yachtName").val(name);
    $("#yachtType").val(typeLabel || "—");

    $(".summary-item h5").text(name);
    $(".summary-item p").text(typeLabel || "");
    $(".summary-item img").attr({ src: hero, alt: name });

    // simpan hint
    try {
      localStorage.setItem("rt_yacht_ref", y.slug || y.id || "");
    } catch {}

    // set batas tamu dinamis (opsional; lihat patch B di bawah untuk JS inline)
    window.RT_MAX_GUESTS =
      y?.capacity && Number.isFinite(+y.capacity) ? +y.capacity : 12;
    $(".destination-info").text(
      y?.island
        ? `Primary cruising area: ${y.island}`
        : $(".destination-info").text()
    );
  }

  function rebuildPackages(charters) {
    const $wrap = $(".package-details");
    // hapus paket statis
    $wrap.find(".package-option").remove();

    if (!charters.length) return;

    const sorted = [...charters].sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999)
    );
    const html = sorted
      .map((c, idx) => {
        const ccy = c.currency || "USD";
        const rate = Number(c.price) || 0;
        const durDays = Number.isFinite(+c.durationDays)
          ? +c.durationDays
          : null;
        const durHours =
          !durDays && Number.isFinite(+c.durationHours)
            ? +c.durationHours
            : null;

        const durLabel = durDays
          ? `${durDays} day${durDays > 1 ? "s" : ""}`
          : durHours
          ? `${durHours} hour${durHours > 1 ? "s" : ""}`
          : "Per day";
        const priceLabel = `${currencySymbol(ccy)}${rate.toLocaleString(
          ccy === "IDR" ? "id-ID" : "en-US"
        )}${durDays || durHours ? ` (${durLabel})` : " per day"}`;

        return `
        <div class="package-option${idx === 0 ? " selected" : ""}"
             data-value="${c.slug || c.id}"
             data-price="${rate}"
             data-currency="${ccy}"
             data-days="${durDays ?? ""}"
             data-hours="${durHours ?? ""}">
          <div class="package-header">
            <h5>${c.name || "Private Charter"}</h5>
            <div class="package-price">${priceLabel}</div>
          </div>
          <div class="row"><div class="col-md-12">
            <p>${
              (Array.isArray(c.inclusions)
                ? c.inclusions
                    .map((i) => (typeof i === "string" ? i : i?.item || ""))
                    .filter(Boolean)
                    .join(", ")
                : ""
              ).trim() || "All standard inclusions"
            }</p>
          </div></div>
        </div>`;
      })
      .join("");

    $wrap.append(html);

    // Delegated handler untuk paket dinamis + trigger ringkas untuk update summary
    $(document)
      .off("click.pkg")
      .on("click.pkg", ".package-option", function () {
        $(".package-option").removeClass("selected");
        $(this).addClass("selected");
        // paksa kalkulasi ulang oleh script inline
        $("#guestCount").trigger("change");
      });

    // Preselect via ?charter=
    const want = getParam("charter");
    if (want) {
      const $target = $wrap.find(
        `.package-option[data-value="${CSS.escape(want)}"]`
      );
      if ($target.length) {
        $target.addClass("selected").siblings().removeClass("selected");
      }
    }

    // Trigger pertama kali supaya panel kanan ikut sinkron
    $("#guestCount").trigger("change");
  }

  function parseISO(d) {
    const t = d ? new Date(d) : null;
    return t && !isNaN(t.valueOf()) ? t : null;
  }
  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function applySchedulesToDatepicker(schedules) {
    // Kumpulkan range yg tidak boleh dipilih (reserved/maintenance)
    const blocked = (schedules || [])
      .filter((s) => s?.status && s.status !== "available")
      .map((s) => ({
        start: parseISO(s.startDate),
        end: parseISO(s.endDate),
        status: s.status,
      }))
      .filter((x) => x.start && x.end);

    // destroy lalu re-init dengan beforeShowDay
    $(".datepicker").datepicker("destroy");
    $(".datepicker").datepicker({
      format: "mm/dd/yyyy",
      autoclose: true,
      todayHighlight: true,
      startDate: new Date(),
      beforeShowDay: function (date) {
        // disable jika berada dalam salah satu blocked range
        for (const r of blocked) {
          if (date >= r.start && date <= r.end) {
            return {
              enabled: false,
              classes: r.status === "maintenance" ? "text-muted" : "",
              tooltip: r.status === "maintenance" ? "Maintenance" : "Reserved",
            };
          }
        }
        return true;
      },
    });

    // Prefill dari ?start & ?end bila valid
    const ps = parseISO(getParam("start"));
    const pe = parseISO(getParam("end"));
    if (ps) $("#startDate").datepicker("setDate", ps);
    if (pe) $("#endDate").datepicker("setDate", pe);

    // Jika paket dipilih punya durasiDays -> kunci endDate = startDate + n
    $(document)
      .off("change.lockEnd")
      .on("change.lockEnd", "#startDate", function () {
        const $sel = $(".package-option.selected");
        const days = Number($sel.data("days")) || null;
        if (days && $("#startDate").datepicker("getDate")) {
          const s = $("#startDate").datepicker("getDate");
          const e = new Date(s);
          e.setDate(e.getDate() + days);
          $("#endDate").datepicker("setDate", e);
        }
      });
  }

  $(async function () {
    const ref = getParam("yacht") || localStorage.getItem("rt_yacht_ref") || "";
    if (!ref) return;

    try {
      const yacht = await getYacht(ref);
      if (!yacht) return;

      fillTopInfo(yacht);

      // fetch dan render paket
      getCharters(yacht.id)
        .then(rebuildPackages)
        .catch(() => {});

      // terapkan jadwal ke datepicker (disable reserved/maintenance)
      if (Array.isArray(yacht.schedules))
        applySchedulesToDatepicker(yacht.schedules);
    } catch (e) {
      console.warn("[booking] load failed:", e);
    }
  });
})(jQuery);
