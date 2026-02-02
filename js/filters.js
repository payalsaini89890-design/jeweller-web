// Product Filtering and Search JavaScript

class ProductFilter {
    constructor(collectionType, onFilterCallback) {
        this.type = collectionType; // 'gold' or 'platinum'
        this.onFilter = onFilterCallback;
        this.filters = {
            search: '',
            priceRange: 500000,
            purity: [],
            jewelryType: []
        };
        this.init();
    }

    init() {
        this.renderUI();
        this.attachListeners();
    }

    renderUI() {
        const container = document.getElementById('filterContainer');
        if (!container) return;

        // Wrap the existing filter content in a sidebar structure
        container.innerHTML = `
            <!-- Filter Trigger Button -->
            <button class="filter-trigger-btn" id="filterTrigger">
                Filters
            </button>

            <!-- Filter Overlay -->
            <div class="filters-overlay" id="filterOverlay"></div>

            <!-- Filter Sidebar -->
            <div class="filters-sidebar" id="filterSidebar">
                <div class="filters-container">
                    <div class="filters-header">
                        <h4 class="filters-title">Filters</h4>
                        <button class="filters-close" id="filterClose">×</button>
                    </div>

                    <div class="search-box">
                        <input type="text" class="search-input" id="filterSearch" placeholder="Search products...">
                        <span class="search-icon">🔍</span>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Max Price: <span id="priceVal">₹5,00,000</span></label>
                        <input type="range" class="price-slider" id="filterPrice" min="0" max="500000" step="5000" value="500000">
                        <div class="price-values">
                            <span>₹0</span>
                            <span>₹5L+</span>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Purity / Grade</label>
                        <div class="filter-options">
                            ${this.type === 'gold' ? `
                                <div class="filter-option"><input type="checkbox" class="purity-check" value="24K" id="p24"> <label for="p24">24K Gold</label></div>
                                <div class="filter-option"><input type="checkbox" class="purity-check" value="22K" id="p22"> <label for="p22">22K Gold</label></div>
                                <div class="filter-option"><input type="checkbox" class="purity-check" value="18K" id="p18"> <label for="p18">18K Gold</label></div>
                            ` : `
                                <div class="filter-option"><input type="checkbox" class="purity-check" value="Platinum" id="pPlat"> <label for="pPlat">Pure Platinum</label></div>
                            `}
                        </div>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Category</label>
                        <div class="filter-options">
                            <div class="filter-option"><input type="checkbox" class="type-check" value="earring" id="t1"> <label for="t1">Earrings</label></div>
                            <div class="filter-option"><input type="checkbox" class="type-check" value="necklace" id="t2"> <label for="t2">Necklaces</label></div>
                            <div class="filter-option"><input type="checkbox" class="type-check" value="ring" id="t3"> <label for="t3">Rings</label></div>
                            <div class="filter-option"><input type="checkbox" class="type-check" value="bracelet" id="t4"> <label for="t4">Bracelets</label></div>
                            <div class="filter-option"><input type="checkbox" class="type-check" value="pendant" id="t5"> <label for="t5">Pendants</label></div>
                            <div class="filter-option"><input type="checkbox" class="type-check" value="bangle" id="t6"> <label for="t6">Bangles</label></div>
                        </div>
                    </div>

                    <button class="filters-clear" id="btnResetFilters">Reset All Filters</button>
                </div>
            </div>
        `;
    }

    attachListeners() {
        const sidebar = document.getElementById('filterSidebar');
        const overlay = document.getElementById('filterOverlay');
        const trigger = document.getElementById('filterTrigger');
        const closeBtn = document.getElementById('filterClose');

        const searchInput = document.getElementById('filterSearch');
        const priceSlider = document.getElementById('filterPrice');
        const priceLabel = document.getElementById('priceVal');
        const purityChecks = document.querySelectorAll('.purity-check');
        const typeChecks = document.querySelectorAll('.type-check');
        const resetBtn = document.getElementById('btnResetFilters');

        // Sidebar Toggle Logic
        const toggleSidebar = (show) => {
            sidebar.classList.toggle('active', show);
            overlay.classList.toggle('active', show);
            document.body.style.overflow = show ? 'hidden' : '';
        };

        trigger.addEventListener('click', () => toggleSidebar(true));
        closeBtn.addEventListener('click', () => toggleSidebar(false));
        overlay.addEventListener('click', () => toggleSidebar(false));

        // Search - debounced
        let timeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.filters.search = searchInput.value.toLowerCase();
                this.applyFilters();
            }, 300);
        });

        // Price
        priceSlider.addEventListener('input', () => {
            const val = parseInt(priceSlider.value);
            this.filters.priceRange = val;
            priceLabel.textContent = `₹${val.toLocaleString()}${val === 500000 ? '+' : ''}`;
            this.applyFilters();
        });

        // Purity Checkboxes
        purityChecks.forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.purity = Array.from(purityChecks)
                    .filter(c => c.checked)
                    .map(c => c.value);
                this.applyFilters();
            });
        });

        // Type Checkboxes
        typeChecks.forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.jewelryType = Array.from(typeChecks)
                    .filter(c => c.checked)
                    .map(c => c.value);
                this.applyFilters();
            });
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            priceSlider.value = 500000;
            priceLabel.textContent = '₹5,00,000+';
            purityChecks.forEach(c => c.checked = false);
            typeChecks.forEach(c => c.checked = false);

            this.filters = { search: '', priceRange: 500000, purity: [], jewelryType: [] };
            this.applyFilters();
            toggleSidebar(false);
        });
    }

    applyFilters() {
        this.onFilter(this.filters);
    }
}
