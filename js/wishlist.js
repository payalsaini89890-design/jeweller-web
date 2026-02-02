// Wishlist Management JavaScript

class WishlistManager {
  constructor() {
    this.userIdentifier = this.getUserIdentifier();
    this.wishlist = new Set();
    this.init();
  }

  getUserIdentifier() {
    // Get or create a unique identifier for this user
    let identifier = localStorage.getItem("atelier_user_id");
    if (!identifier) {
      identifier =
        "user_" + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem("atelier_user_id", identifier);
    }
    return identifier;
  }

  async init() {
    await this.loadWishlist();
    this.updateUI();
  }

  async loadWishlist() {
    try {
      const { data, error } = await window.supabaseText
        .from("wishlists")
        .select("jewellery_id")
        .eq("user_identifier", this.userIdentifier);

      if (error) throw error;

      this.wishlist = new Set(data.map((item) => item.jewellery_id));
    } catch (err) {
      console.error("Error loading wishlist:", err);
    }
  }

  async toggle(jewelleryId) {
    if (this.wishlist.has(jewelleryId)) {
      await this.remove(jewelleryId);
    } else {
      await this.add(jewelleryId);
    }
  }

  async add(jewelleryId) {
    try {
      const { error } = await window.supabaseText.from("wishlists").insert([
        {
          user_identifier: this.userIdentifier,
          jewellery_id: jewelleryId,
        },
      ]);

      if (error) throw error;

      this.wishlist.add(jewelleryId);

      // Update wishlist count in jewellery table
      await this.updateWishlistCount(jewelleryId, 1);

      this.updateUI();
      this.showNotification("Added to wishlist ♥");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      this.showNotification("Failed to add to wishlist", "error");
    }
  }

  async remove(jewelleryId) {
    try {
      const { error } = await window.supabaseText
        .from("wishlists")
        .delete()
        .eq("user_identifier", this.userIdentifier)
        .eq("jewellery_id", jewelleryId);

      if (error) throw error;

      this.wishlist.delete(jewelleryId);

      // Update wishlist count in jewellery table
      await this.updateWishlistCount(jewelleryId, -1);

      this.updateUI();
      this.showNotification("Removed from wishlist");
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      this.showNotification("Failed to remove from wishlist", "error");
    }
  }

  async updateWishlistCount(jewelleryId, delta) {
    try {
      // Get current count
      const { data } = await window.supabaseText
        .from("jewellery")
        .select("wishlist_count")
        .eq("id", jewelleryId)
        .single();

      const newCount = Math.max(0, (data?.wishlist_count || 0) + delta);

      await window.supabaseText
        .from("jewellery")
        .update({ wishlist_count: newCount })
        .eq("id", jewelleryId);
    } catch (err) {
      console.error("Error updating wishlist count:", err);
    }
  }

  isInWishlist(jewelleryId) {
    return this.wishlist.has(jewelleryId);
  }

  getCount() {
    return this.wishlist.size;
  }

  updateUI() {
    // Update all wishlist buttons
    document.querySelectorAll("[data-wishlist-id]").forEach((btn) => {
      const id = btn.dataset.wishlistId;
      const isWishlisted = this.isInWishlist(id);

      btn.classList.toggle("wishlisted", isWishlisted);
      btn.innerHTML = isWishlisted ? "♥" : "♡";
      btn.setAttribute(
        "aria-label",
        isWishlisted ? "Remove from wishlist" : "Add to wishlist",
      );
    });

    // Update wishlist counter in header
    const counter = document.getElementById("wishlist-count");
    if (counter) {
      const count = this.getCount();
      counter.textContent = count;
      counter.style.display = count > 0 ? "flex" : "none";
    }
  }

  showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `wishlist-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 10);

    // Remove after 2 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Initialize wishlist manager
let wishlistManager;
document.addEventListener("DOMContentLoaded", () => {
  wishlistManager = new WishlistManager();
});

// Global function to toggle wishlist
function toggleWishlist(jewelleryId) {
  if (wishlistManager) {
    wishlistManager.toggle(jewelleryId);
  }
}

// Add wishlist notification styles dynamically
const wishlistStyles = document.createElement("style");
wishlistStyles.textContent = `
    .wishlist-notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--crimson);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }

    .wishlist-notification.show {
        opacity: 1;
        transform: translateY(0);
    }

    .wishlist-notification.error {
        background: #ff6b6b;
    }

    .wishlist-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #ccc;
        transition: all 0.3s ease;
        padding: 5px;
    }

    .wishlist-btn:hover {
        color: var(--crimson);
        transform: scale(1.2);
    }

    .wishlist-btn.wishlisted {
        color: var(--crimson);
        animation: heartBeat 0.3s ease;
    }

    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }

    #wishlist-count {
        position: absolute;
        top: -8px;
        right: -10px;
        background: var(--crimson);
        color: white;
        font-size: 0.65rem;
        font-weight: 600;
        padding: 2px 5px;
        border-radius: 50%;
        min-width: 14px;
        height: 14px;
        display: none;
        align-items: center;
        justify-content: center;
        line-height: 1;
        border: 2px solid white;
    }
`;
document.head.appendChild(wishlistStyles);
