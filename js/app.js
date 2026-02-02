// --- Lenis Smooth Scroll Configuration ---
const lenis = new Lenis({
    duration: 2.2, // Extra slow/smooth for "luxury" feel
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- Scroll Logic ---
const header = document.getElementById('header');
const parallaxImage = document.getElementById('parallax-image');

if (header || parallaxImage) {
    lenis.on('scroll', ({ scroll }) => {
        // Header sticky effect
        if (header) {
            if (scroll > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Parallax effect
        if (parallaxImage) {
            const rect = parallaxImage.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.08;
                parallaxImage.style.transform = `translateY(${rect.top * speed}px)`;
            }
        }

        // Reveal sections
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                el.classList.add('active');
            }
        });
    });
}

// Trigger reveal for top elements
window.addEventListener('load', () => {
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('active');
    });
});
