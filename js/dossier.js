/**
 * Dossier: The Immersive Product Detail Experience
 * Fixed Version: Ensures content visibility and layout alignment.
 */

class DossierManager {
  constructor() {
    this.overlay = null;
    this.productId = null;
    this.scrollTriggers = [];
    this.init();
  }

  init() {
    if (!document.getElementById("dossier-root")) {
      const root = document.createElement("div");
      root.id = "dossier-root";
      document.body.appendChild(root);
    }
    this.root = document.getElementById("dossier-root");
  }

  async open(productId, allItems = []) {
    console.log("Opening Dossier for:", productId);
    this.productId = productId;
    const item = allItems.find((it) => it.id === productId);
    if (!item) {
      console.error("Item not found in data suite:", productId);
      return;
    }

    // 1. Prepare Data
    const data = {
      id: item.id,
      name: item.name,
      price: item.price,
      desc:
        item.description ||
        "A celestial union of ancient Jadau artistry and contemporary regality. This masterpiece features rare Syndicate diamonds, meticulously hand-set in hallmarked gold.",
      category: item.category || "THE ATELIER",
      type: item.jewelry_type || "Masterpiece",
      purity: item.gold_purity || "Standard Purity",
      serial: `REF. AT-2026-${Math.floor(100 + Math.random() * 900)}`,
      images: [item.image_url, item.image_url_2, item.image_url_3].filter(
        (i) => i,
      ),
      metal: item.gold_purity
        ? `${item.gold_purity} Yellow Gold`
        : "Heritage Gold",
      grossWeight: "64.820 g",
      netWeight: "58.200 g",
      setting: "Hand-Pressed Jadau",
      artisan: "Ustad Rahim Khan",
      experience: "32 years",
    };

    // 2. Recommendations (Fixed: Same jewelry_type, slice 2)
    const recommendations = allItems
      .filter(
        (it) => it.id !== productId && it.jewelry_type === item.jewelry_type,
      )
      .slice(0, 2);

    // 3. Inject HTML
    this.root.innerHTML = this.render(data, recommendations);

    // 4. Reveal UI
    document.body.classList.add("d-open");
    this.overlay = document.querySelector(".dossier-overlay");
    this.overlay.style.display = "block";

    // 5. Fail-safe visibility (If GSAP fails or takes too long)
    setTimeout(() => {
      document.querySelectorAll(".reveal, .reveal-init").forEach((el) => {
        if (parseFloat(window.getComputedStyle(el).opacity) === 0) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 3000);

    // Wait for DOM
    setTimeout(() => {
      this.overlay.classList.add("active");
      this.initMotion();
    }, 100);

    this.overlay.scrollTop = 0;
  }

  render(d, recs) {
    return `
            <div class="dossier-overlay">
                <nav class="dossier-nav">
                    <div class="dossier-logo">THE ATELIER</div>
                    <button class="dossier-close" onclick="dossier.close()">Close Dossier</button>
                </nav>

                <div class="dossier-grid">
                    <div class="dossier-media">
                        <span class="d-serial" style="position:absolute; top:40px; left:40px;">${d.serial}</span>
                        <img id="d-main-img" class="dossier-main-img" src="${d.images[0]}" onclick="dossier.openZoom(this.src)">
                        
                        <div class="dossier-thumbs">
                            ${d.images
                              .map(
                                (img, i) => `
                                <div class="dossier-thumb ${i === 0 ? "active" : ""}" onclick="dossier.swapImg(this, '${img}')">
                                    <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    <div class="dossier-info">
                        <span class="d-serial reveal-init">${d.category.toUpperCase()} COLLECTION</span>
                        <h1 class="d-title reveal-init">${d.name}</h1>
                        <span class="d-price reveal-init">${d.price}</span>

                        <div class="d-prose reveal-init">${d.desc}</div>

                        <span class="d-label reveal">TECHNICAL ANATOMY</span>
                        <div class="d-spec-grid reveal">
                            <div class="d-spec-item"><h4>Metal</h4><p>${d.metal}</p></div>
                            <div class="d-spec-item"><h4>Gross Mass</h4><p>${d.grossWeight}</p></div>
                            <div class="d-spec-item"><h4>Purity</h4><p>${d.purity}</p></div>
                            <div class="d-spec-item"><h4>Setting</h4><p>${d.setting}</p></div>
                        </div>

                        <div class="d-atelier reveal">
                            <h3>Atelier Supervision</h3>
                            <p>Handcrafted under the guidance of <b>${d.artisan}</b>, Master Jadau Artisan with over <b>${d.experience}</b> of royal workshop experience.</p>
                            <blockquote>“Gold must breathe. Stones must listen.”</blockquote>
                        </div>

                        <div class="d-timeline reveal">
                            <div class="d-timeline-item"><span>1748</span><h4>Royal Workshop Origins</h4></div>
                            <div class="d-timeline-item"><span>1821</span><h4>Polki Refinement Era</h4></div>
                            <div class="d-timeline-item"><span>2026</span><h4>Archival Revival</h4></div>
                        </div>
                    </div>
                </div>

                <section class="d-ritual">
                    <h2 class="reveal">The Commissioning Ritual</h2>
                    <div class="d-ritual-steps">
                        <div class="d-ritual-step reveal"><span>STEP I</span><p>Private Viewing</p></div>
                        <div class="d-ritual-step reveal"><span>STEP II</span><p>Atelier Allocation</p></div>
                        <div class="d-ritual-step reveal"><span>STEP III</span><p>Craft Confirmation</p></div>
                        <div class="d-ritual-step reveal"><span>STEP IV</span><p>Legacy Delivery</p></div>
                    </div>
                </section>

                <div class="trust reveal" style="text-align:center; padding:60px; color:#999; letter-spacing:3px; font-size:0.7rem; background:#fcfaf7;">
                    INSURED TRANSIT • WHITE-GLOVE DELIVERY • DISCREET PACKAGING
                </div>

                ${
                  recs.length > 0
                    ? `
                <section class="d-ensemble reveal">
                    <h3 class="d-ensemble-title">Complete the Ensemble</h3>
                    <div class="d-ensemble-grid">
                        ${recs
                          .map(
                            (r) => `
                            <div class="d-ensemble-item" onclick="dossier.open('${r.id}', allItems)">
                                <img src="${r.image_url}">
                                <h4>${r.name}</h4>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </section>
                `
                    : ""
                }

                <div class="d-actions">
                    <button class="d-btn d-btn-dark" onclick="handleEnquiry()" style="min-width: 280px; letter-spacing: 5px;">Request Enquiry</button>
                    <button class="wishlist-btn" id="d-wish-btn" data-wishlist-id="${d.id}" onclick="toggleWishlist('${d.id}')" style="background:#fff; border:1px solid #ddd; padding:15px; border-radius:50%; cursor:pointer; width:55px; height:55px; display:flex; align-items:center; justify-content:center; transition:0.3s;">♡</button>
                </div>

                <div id="d-zoom" onclick="dossier.closeZoom()">
                    <img id="d-zoom-img" src="">
                </div>
            </div>
        `;
  }

  initMotion() {
    this.scrollTriggers.forEach((st) => st.kill());
    this.scrollTriggers = [];

    // 1. Initial Staggered Reveal
    gsap.to(".dossier-overlay .reveal-init", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power4.out",
    });

    // 2. Scroll-Based Reveals
    const reveals = document.querySelectorAll(".dossier-overlay .reveal");
    reveals.forEach((el) => {
      const st = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          scroller: ".dossier-overlay",
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
      this.scrollTriggers.push(st);
    });

    // 3. Parallax Image
    const mainImg = document.getElementById("d-main-img");
    if (mainImg) {
      const st = gsap.to(mainImg, {
        y: 60,
        scale: 1.08,
        scrollTrigger: {
          trigger: ".dossier-grid",
          scroller: ".dossier-overlay",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      this.scrollTriggers.push(st);
    }

    // Initialize Wishlist State
    const wishBtn = document.getElementById("d-wish-btn");
    if (wishBtn && typeof wishlistManager !== "undefined") {
      const isLiked = wishlistManager.isInWishlist(this.productId);
      wishBtn.innerHTML = isLiked ? "♥" : "♡";
      if (isLiked) wishBtn.classList.add("wishlisted");
    }

    // 4. Local Lenis for Overlay Mousewheel
    if (typeof Lenis !== "undefined") {
      this.lenis = new Lenis({
        wrapper: this.overlay,
        content: this.overlay.querySelector(".dossier-grid").parentElement,
        lerp: 0.1,
        smoothWheel: true,
      });

      const dossierRaf = (time) => {
        if (this.lenis) {
          this.lenis.raf(time);
          requestAnimationFrame(dossierRaf);
        }
      };
      requestAnimationFrame(dossierRaf);
    }
  }

  close() {
    if (!this.overlay) return;
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
    this.overlay.classList.remove("active");
    document.body.classList.remove("d-open");
    setTimeout(() => {
      this.root.innerHTML = "";
      this.overlay = null;
    }, 800);
  }

  swapImg(el, url) {
    document
      .querySelectorAll(".dossier-thumb")
      .forEach((t) => t.classList.remove("active"));
    el.classList.add("active");
    const main = document.getElementById("d-main-img");
    main.style.opacity = 0;
    setTimeout(() => {
      main.src = url;
      main.style.opacity = 1;
    }, 300);
  }

  openZoom(url) {
    const zoom = document.getElementById("d-zoom");
    const img = document.getElementById("d-zoom-img");
    img.src = url;
    zoom.style.display = "flex";
    setTimeout(() => (zoom.style.opacity = "1"), 10);
  }

  closeZoom() {
    const zoom = document.getElementById("d-zoom");
    zoom.style.opacity = "0";
    setTimeout(() => (zoom.style.display = "none"), 600);
  }
}

// Global instance
const dossier = new DossierManager();

// Compatibility function
function openProductDetail(id) {
  dossier.open(id, allItems);
}
