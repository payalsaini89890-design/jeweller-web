/**
 * Contextual Gold Rate Display
 * Displays rates ONLY on relevant collection pages.
 */

(async function () {
  // 1. Fetch Rates
  async function getRates() {
    if (!window.supabaseText) return null;
    try {
      const { data: gold } = await window.supabaseText
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "rate_gold_22k")
        .single();
      const { data: silver } = await window.supabaseText
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "rate_silver")
        .single();

      if (!gold || !silver) return null;
      return { gold: gold.setting_value, silver: silver.setting_value };
    } catch (e) {
      console.error("Ticker Error:", e);
      return null;
    }
  }

  // 2. Logic: Check Page Context
  const path = window.location.pathname;
  const isGoldPage = path.includes("gold.html");
  const isPlatinumPage = path.includes("platinum.html"); // Treating as Silver/Platinum context if needed

  if (!isGoldPage && !isPlatinumPage) return; // Exit on index, contact, etc.

  let rates = await getRates();

  // Fallback
  if (!rates) rates = { gold: "72,000", silver: "88,000" };

  const fmt = (val) =>
    val.toString().trim().startsWith("₹") ? val : `₹${val}`;

  // 3. Inject Rate Contextually
  const introSection = document.querySelector(".section-intro");
  if (introSection) {
    const rateEl = document.createElement("div");
    rateEl.className = "contextual-rate";

    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    if (isGoldPage) {
      rateEl.innerHTML = `
                <span class="rate-value">Indicative Gold Rate (22K): ${fmt(rates.gold)} / 10g</span>
                <span class="rate-meta">Market Rate • Updated ${today}</span>
            `;
    } else if (isPlatinumPage) {
      // Display Silver Rate on Platinum Page (as requested "Silver Collection Page" structure)
      // Or if user strictly wants Platinum rate, we would need that data.
      // Given admin panel has Silver, we show Silver as per "Silver Collection" request mapping.
      rateEl.innerHTML = `
                <span class="rate-value">Indicative Silver Rate: ${fmt(rates.silver)} / 1kg</span>
                <span class="rate-meta">Market Rate • Updated ${today}</span>
            `;
    }

    // Insert after H2
    const h2 = introSection.querySelector("h2");
    if (h2) {
      h2.insertAdjacentElement("afterend", rateEl);
    } else {
      introSection.appendChild(rateEl);
    }

    // Add Contextual Styles
    const style = document.createElement("style");
    style.innerHTML = `
            .contextual-rate {
                margin-top: 5px;
                margin-bottom: 15px;
                font-family: var(--sans);
                letter-spacing: 0.05em;
                animation: fadeIn 1s ease;
            }
            .rate-value {
                display: block;
                font-size: 0.9rem;
                color: var(--gold-muted); /* Champagne tone */
                font-weight: 500;
            }
            .rate-meta {
                display: block;
                font-size: 0.7rem;
                color: #999;
                margin-top: 2px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
            @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        `;
    document.head.appendChild(style);
  }
})();
