// Enhanced Enquiry Modal JavaScript

class EnquiryModal {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.currentProduct = null;
        this.init();
    }

    init() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="enquiryModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Enquire About Product</h2>
                        <p class="modal-subtitle">Fill in your details and we'll get back to you shortly</p>
                    </div>
                    <div class="modal-body">
                        <form id="enquiryForm">
                            <div class="form-field">
                                <label for="enquiry-name">Full Name *</label>
                                <input type="text" id="enquiry-name" required placeholder="Enter your name">
                                <span class="form-error">Please enter your name</span>
                            </div>
                            <div class="form-field">
                                <label for="enquiry-phone">Phone Number *</label>
                                <input type="tel" id="enquiry-phone" required placeholder="+91 XXXXX XXXXX" pattern="[0-9+\\s-]+">
                                <span class="form-error">Please enter a valid phone number</span>
                            </div>
                            <div class="form-field">
                                <label for="enquiry-email">Email (Optional)</label>
                                <input type="email" id="enquiry-email" placeholder="your@email.com">
                                <span class="form-error">Please enter a valid email</span>
                            </div>
                            <div class="form-field">
                                <label for="enquiry-message">Message (Optional)</label>
                                <textarea id="enquiry-message" placeholder="Any specific requirements or questions..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="modal-btn modal-btn-cancel" onclick="enquiryModal.close()">Cancel</button>
                        <button type="submit" form="enquiryForm" class="modal-btn modal-btn-submit">Send Enquiry</button>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        this.modal = document.getElementById('enquiryModal');
        this.overlay = this.modal;

        // Event listeners
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        document.getElementById('enquiryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    open(productData = {}) {
        this.currentProduct = productData;

        // Update modal title if product name is provided
        if (productData.name) {
            this.modal.querySelector('.modal-title').textContent = `Enquire About ${productData.name}`;
        }

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            this.modal.querySelector('#enquiry-name').focus();
        }, 300);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form after animation
        setTimeout(() => {
            this.reset();
        }, 300);
    }

    validateField(field) {
        const fieldContainer = field.parentElement;
        let isValid = true;

        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
        } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            isValid = false;
        } else if (field.type === 'tel' && field.value && !this.isValidPhone(field.value)) {
            isValid = false;
        }

        if (isValid) {
            fieldContainer.classList.remove('error');
        } else {
            fieldContainer.classList.add('error');
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[0-9+\s-]{10,}$/.test(phone);
    }

    async handleSubmit() {
        const form = document.getElementById('enquiryForm');
        const submitBtn = this.modal.querySelector('.modal-btn-submit');

        // Validate all fields
        const inputs = form.querySelectorAll('input[required], input[type="email"]');
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Get form data
        const data = {
            customer_name: document.getElementById('enquiry-name').value.trim(),
            customer_phone: document.getElementById('enquiry-phone').value.trim(),
            customer_message: document.getElementById('enquiry-message').value.trim()
        };

        // Add email if provided
        const email = document.getElementById('enquiry-email').value.trim();
        if (email) {
            data.customer_message = `Email: ${email}\n${data.customer_message}`;
        }

        // Add product info if available
        if (this.currentProduct.id) {
            data.jewellery_id = this.currentProduct.id;
            data.jewellery_name = this.currentProduct.name;
            if (!data.customer_message) {
                data.customer_message = `Enquiry for ${this.currentProduct.name}`;
            }
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const { error } = await window.supabaseText
                .from('enquiries')
                .insert([data]);

            if (error) throw error;

            // Show success
            this.showSuccess();
        } catch (err) {
            console.error('Error sending enquiry:', err);
            alert('Failed to send enquiry. Please try again or contact us directly.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Enquiry';
        }
    }

    showSuccess() {
        const modalBody = this.modal.querySelector('.modal-body');
        const modalFooter = this.modal.querySelector('.modal-footer');

        modalBody.innerHTML = `
            <div class="modal-success">
                <div class="modal-success-icon">✓</div>
                <h3>Enquiry Sent Successfully!</h3>
                <p>Thank you for your interest. Our team will contact you shortly.</p>
                <button class="modal-btn modal-btn-submit" onclick="enquiryModal.close()">Close</button>
            </div>
        `;
        modalFooter.style.display = 'none';

        // Auto close after 3 seconds
        setTimeout(() => {
            this.close();
        }, 3000);
    }

    reset() {
        const form = document.getElementById('enquiryForm');
        if (form) {
            form.reset();
            this.modal.querySelectorAll('.form-field').forEach(field => {
                field.classList.remove('error');
            });
        }

        // Reset modal content
        const modalBody = this.modal.querySelector('.modal-body');
        const modalFooter = this.modal.querySelector('.modal-footer');

        if (!modalBody.querySelector('form')) {
            location.reload(); // Simple reset by reloading
        }

        modalFooter.style.display = '';
        this.modal.querySelector('.modal-title').textContent = 'Enquire About Product';

        const submitBtn = this.modal.querySelector('.modal-btn-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Enquiry';
        }
    }
}

// Initialize modal
let enquiryModal;
document.addEventListener('DOMContentLoaded', () => {
    enquiryModal = new EnquiryModal();
});

// Global function to open modal (for backward compatibility)
function openEnquiryModal(productData) {
    if (enquiryModal) {
        enquiryModal.open(productData);
    }
}
