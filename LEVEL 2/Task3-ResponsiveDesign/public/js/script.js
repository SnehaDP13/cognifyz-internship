// Client-side form validation and dynamic DOM interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== FORM VALIDATION ==========
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Validate Name
            const nameInput = document.querySelector('input[name="name"]');
            const name = nameInput.value.trim();
            if (name.length < 2) {
                showError(nameInput, 'Name must be at least 2 characters');
                isValid = false;
            } else {
                removeError(nameInput);
            }
            
            // Validate Phone (10 digits)
            const phoneInput = document.querySelector('input[name="phone"]');
            const phone = phoneInput.value.trim();
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                showError(phoneInput, 'Please enter a valid 10-digit phone number');
                isValid = false;
            } else {
                removeError(phoneInput);
            }
            
            // Validate Date (not in past)
            const dateInput = document.querySelector('input[name="date"]');
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (!dateInput.value) {
                showError(dateInput, 'Please select a date');
                isValid = false;
            } else if (selectedDate < today) {
                showError(dateInput, 'Please select a future date');
                isValid = false;
            } else {
                removeError(dateInput);
            }
            
            // Validate Time
            const timeInput = document.querySelector('select[name="time"]');
            if (!timeInput.value) {
                showError(timeInput, 'Please select a time');
                isValid = false;
            } else {
                removeError(timeInput);
            }
            
            // Validate Guests
            const guestsInput = document.querySelector('input[name="guests"]');
            const guests = parseInt(guestsInput.value);
            if (isNaN(guests) || guests < 1 || guests > 20) {
                showError(guestsInput, 'Number of guests must be between 1 and 20');
                isValid = false;
            } else {
                removeError(guestsInput);
            }
            
            if (!isValid) {
                e.preventDefault();
                const firstError = document.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        
        // Real-time phone number formatting
        const phoneInput = document.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
                if (this.value.length === 10) {
                    removeError(this);
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                }
            });
        }
        
        // Real-time name validation
        const nameInput = document.querySelector('input[name="name"]');
        if (nameInput) {
            nameInput.addEventListener('input', function(e) {
                if (this.value.trim().length >= 2) {
                    removeError(this);
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                }
            });
        }
        
        // Real-time guests validation
        const guestsInput = document.querySelector('input[name="guests"]');
        if (guestsInput) {
            guestsInput.addEventListener('input', function(e) {
                const val = parseInt(this.value);
                if (val >= 1 && val <= 20) {
                    removeError(this);
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                }
            });
        }
    }
    
    // ========== SMOOTH SCROLLING ==========
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        navbarCollapse.classList.remove('show');
                    }
                }
            }
        });
    });
    
    // ========== SCROLL REVEAL ANIMATIONS ==========
    const animatedElements = document.querySelectorAll('.feature-card, .gallery-item, .testimonial-card, .ambiance-card');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ========== NAVBAR BACKGROUND ON SCROLL ==========
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            }
        });
    }
    
    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // ========== ACTIVE NAV LINK ON SCROLL ==========
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.navbar-nav .nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.classList.add('active');
            }
        });
    });
    
});

// Helper functions
function showError(input, message) {
    removeError(input);
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.style.display = 'block';
    errorDiv.innerText = message;
    
    input.parentNode.appendChild(errorDiv);
}

function removeError(input) {
    input.classList.remove('is-invalid');
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}