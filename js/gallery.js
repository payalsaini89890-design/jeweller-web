// Product Image Gallery JavaScript

class ProductGallery {
    constructor(elementId, images = []) {
        this.container = document.getElementById(elementId);
        this.images = images.filter(img => img); // Remove null/empty strings
        this.currentIndex = 0;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.render();
    }

    render() {
        if (this.images.length === 0) {
            this.container.innerHTML = '<div class="gallery-placeholder">No images available</div>';
            return;
        }

        const html = `
            <div class="gallery-main" id="galleryMain">
                <img src="${this.images[this.currentIndex]}" alt="Product Image" id="mainImage">
                ${this.images.length > 1 ? `
                    <button class="gallery-nav prev" id="prevBtn">‹</button>
                    <button class="gallery-nav next" id="nextBtn">›</button>
                    <div class="gallery-indicator">
                        ${this.images.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
                    </div>
                ` : ''}
            </div>
            ${this.images.length > 1 ? `
                <div class="gallery-thumbnails">
                    ${this.images.map((img, i) => `
                        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                            <img src="${img}" alt="Thumbnail ${i + 1}">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        const mainImg = this.container.querySelector('#mainImage');
        const prevBtn = this.container.querySelector('#prevBtn');
        const nextBtn = this.container.querySelector('#nextBtn');
        const thumbs = this.container.querySelectorAll('.gallery-thumb');
        const dots = this.container.querySelectorAll('.gallery-dot');

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.goTo(parseInt(thumb.dataset.index));
            });
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goTo(parseInt(dot.dataset.index));
            });
        });

        // Zoom functionality
        if (mainImg) {
            mainImg.parentElement.addEventListener('click', () => this.openLightbox());
        }

        // Swipe support
        this.attachSwipe();
    }

    prev() {
        this.goTo((this.currentIndex - 1 + this.images.length) % this.images.length);
    }

    next() {
        this.goTo((this.currentIndex + 1) % this.images.length);
    }

    goTo(index) {
        if (index === this.currentIndex) return;

        const mainImg = this.container.querySelector('#mainImage');
        const thumbs = this.container.querySelectorAll('.gallery-thumb');
        const dots = this.container.querySelectorAll('.gallery-dot');

        // Transition effect
        mainImg.style.opacity = '0';

        setTimeout(() => {
            this.currentIndex = index;
            mainImg.src = this.images[this.currentIndex];
            mainImg.style.opacity = '1';

            thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }, 200);
    }

    attachSwipe() {
        const main = this.container.querySelector('.gallery-main');
        if (!main) return;

        let startX = 0;
        let diff = 0;

        main.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        main.addEventListener('touchmove', (e) => {
            diff = e.touches[0].clientX - startX;
        }, { passive: true });

        main.addEventListener('touchend', () => {
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.prev();
                else this.next();
            }
            diff = 0;
        });
    }

    openLightbox() {
        let lightbox = document.getElementById('galleryLightbox');
        if (!lightbox) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="gallery-lightbox" id="galleryLightbox">
                    <button class="gallery-lightbox-close">&times;</button>
                    <img src="" id="lightboxImg">
                </div>
            `);
            lightbox = document.getElementById('galleryLightbox');
            lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) lightbox.classList.remove('active');
            });
        }

        const lightboxImg = document.getElementById('lightboxImg');
        lightboxImg.src = this.images[this.currentIndex];
        lightbox.classList.add('active');
    }
}

// Global helper for the side panel
let activeGallery = null;
function initProductGallery(elementId, images) {
    activeGallery = new ProductGallery(elementId, images);
    return activeGallery;
}
