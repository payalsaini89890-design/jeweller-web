// Mobile Menu JavaScript

class MobileMenu {
  constructor() {
    this.init();
  }

  init() {
    // Create mobile menu HTML
    const menuHTML = `
            <button class="hamburger" id="hamburger" aria-label="Toggle menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>

            <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
            
            <div class="mobile-menu" id="mobileMenu">
                <div class="mobile-menu-header">
                    <span class="mobile-menu-logo">THE ATELIER</span>
                    <button class="mobile-menu-close" id="mobileMenuClose">×</button>
                </div>
                <nav class="mobile-menu-nav">
                    <ul id="mobileMenuList">
                        <!-- Menu items will be cloned from desktop nav -->
                    </ul>
                </nav>
                <div class="mobile-menu-footer">
                    <div class="mobile-menu-contact">
                        <p>Visit us at:<br>
                        123 Royale Avenue, Diamond District,<br>
                        Metropolis City</p>
                        <p style="margin-top: 10px;">
                            <a href="tel:+910000000000">+91 00000 00000</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

    // Add to header
    const header = document.querySelector("header");
    if (header) {
      header.insertAdjacentHTML("beforeend", menuHTML);
      this.cloneMenuItems();
      this.attachEventListeners();
    }
  }

  cloneMenuItems() {
    const desktopNav = document.querySelector("header nav ul");
    const mobileNav = document.getElementById("mobileMenuList");

    if (desktopNav && mobileNav) {
      // Clone menu items
      const items = desktopNav.querySelectorAll("li");
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        mobileNav.appendChild(clone);
      });

      // Update active state
      this.updateActiveState();
    }
  }

  attachEventListeners() {
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("mobileMenuOverlay");
    const menu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("mobileMenuClose");

    if (hamburger) {
      hamburger.addEventListener("click", () => this.open());
    }

    if (overlay) {
      overlay.addEventListener("click", () => this.close());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Close on menu item click
    const menuLinks = document.querySelectorAll(".mobile-menu-nav a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setTimeout(() => this.close(), 200);
      });
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        this.close();
      }
    });

    // Handle swipe to close
    this.handleSwipe(menu);
  }

  open() {
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("mobileMenuOverlay");
    const menu = document.getElementById("mobileMenu");

    hamburger.classList.add("active");
    overlay.classList.add("active");
    menu.classList.add("active");
    document.body.classList.add("mobile-menu-open");
  }

  close() {
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("mobileMenuOverlay");
    const menu = document.getElementById("mobileMenu");

    hamburger.classList.remove("active");
    overlay.classList.remove("active");
    menu.classList.remove("active");
    document.body.classList.remove("mobile-menu-open");
  }

  updateActiveState() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const menuLinks = document.querySelectorAll(".mobile-menu-nav a");

    menuLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.includes(currentPage)) {
        link.classList.add("active");
      }
    });
  }

  handleSwipe(element) {
    let startX = 0;
    let currentX = 0;

    element.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    element.addEventListener("touchmove", (e) => {
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;

      // Only allow swipe to right (close)
      if (diff > 0) {
        element.style.transform = `translateX(${diff}px)`;
      }
    });

    element.addEventListener("touchend", () => {
      const diff = currentX - startX;

      if (diff > 100) {
        // Swipe threshold reached, close menu
        this.close();
      }

      // Reset transform
      element.style.transform = "";
      startX = 0;
      currentX = 0;
    });
  }
}

// Initialize mobile menu
document.addEventListener("DOMContentLoaded", () => {
  new MobileMenu();
});
