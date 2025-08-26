/**
 * Portal Website JavaScript
 * Main application controller for JDSG website
 */

class App {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.navToggle = document.getElementById('navToggle');
        this.scrollTop = document.getElementById('scrollTop');
        this.loading = document.getElementById('loading');
        this.form = document.getElementById('contactForm');
        
        this.init();
    }

    /** Initialize app components */
    init() {
        this.setupNav();
        this.setupScroll();
        this.setupForm();
        this.setupLoad();
        this.setupParticles();
        this.setupAnimations();
        this.setupServices();
        this.setupButtons();
    }

    /** Setup navigation functionality */
    setupNav() {
        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
            document.body.style.overflow = 
                this.navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Smooth scrolling for nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.closeNav();
                }
            });
        });

        // Active nav link tracking
        this.trackActiveSection();
    }

    /** Close mobile navigation */
    closeNav() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    /** Track active navigation section */
    trackActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-80px 0px -50% 0px' });

        sections.forEach(section => observer.observe(section));
    }

    /** Setup scroll effects */
    setupScroll() {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            // Navbar scroll effect
            if (scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Scroll to top button
            if (scrollY > 300) {
                this.scrollTop.classList.add('visible');
            } else {
                this.scrollTop.classList.remove('visible');
            }

            lastScroll = scrollY;
        });

        // Scroll to top functionality
        this.scrollTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

        /** Setup contact form */
    setupForm() {
        this.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitForm(new FormData(this.form));
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', addRipple);
        });
    }

    /** Setup scroll buttons */
    setupButtons() {
        // Setup hero buttons with smooth scrolling
        document.querySelectorAll('[data-scroll]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = btn.getAttribute('data-scroll');
                scrollTo(target);
            });
        });

        // Ensure scroll-to-top button is working
        const scrollTopBtn = document.getElementById('scrollTop');
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    /** Validate form field */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        this.clearError(field);

        if (field.hasAttribute('required') && !value) {
            message = '此字段为必填项';
            isValid = false;
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            message = '请输入有效的邮箱地址';
            isValid = false;
        }

        if (!isValid) {
            this.showError(field, message);
        }

        return isValid;
    }

    /** Check email validity */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /** Show field error */
    showError(field, message) {
        field.style.borderColor = 'var(--accent-tertiary)';
        
        let errorEl = field.parentNode.querySelector('.error-msg');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-msg';
            errorEl.style.cssText = `
                color: var(--accent-tertiary);
                font-size: 0.8rem;
                margin-top: 0.25rem;
            `;
            field.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    /** Clear field error */
    clearError(field) {
        field.style.borderColor = '';
        const errorEl = field.parentNode.querySelector('.error-msg');
        if (errorEl) {
            errorEl.remove();
        }
    }

    /** Submit contact form */
    async submitForm(formData) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>发送中...';
        submitBtn.disabled = true;

        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage('消息发送成功！我们会尽快与您联系。', 'success');
            this.form.reset();
        } catch (error) {
            this.showMessage('发送失败，请稍后重试。', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    /** Show form message */
    showMessage(text, type) {
        let msgEl = this.form.querySelector('.form-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.className = 'form-message';
            this.form.appendChild(msgEl);
        }

        msgEl.textContent = text;
        msgEl.className = `form-message ${type}`;
        msgEl.style.cssText = `
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-top: 1rem;
            text-align: center;
            animation: fadeInUp 0.3s ease;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
            color: ${type === 'success' ? 'var(--accent-primary)' : 'var(--accent-tertiary)'};
            border: 1px solid ${type === 'success' ? 'var(--accent-primary)' : 'var(--accent-tertiary)'};
        `;

        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 300);
        }, 5000);
    }

    /** Setup loading screen */
    setupLoad() {
        let progress = 0;
        const progressBar = document.querySelector('.progress-bar');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hideLoad(), 500);
            }
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 100);

        // Preload critical resources
        this.preloadAssets();
    }

    /** Hide loading screen */
    hideLoad() {
        this.loading.classList.add('hidden');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            this.loading.style.display = 'none';
            this.triggerEntranceAnimations();
        }, 500);
    }

    /** Preload critical assets */
    preloadAssets() {
        const criticalImages = [
            // Add any critical image URLs here
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    /** Trigger entrance animations */
    triggerEntranceAnimations() {
        const elements = document.querySelectorAll('.fade-in-up, .hero-text, .hero-visual');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in-up');
            }, index * 100);
        });
    }

    /** Setup particle background */
    setupParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 30 : 50;
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        container.appendChild(canvas);

        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        // Animate particles
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(animate);
        };
        animate();
    }

    /** Setup scroll animations */
    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, { rootMargin: '0px 0px -100px 0px' });

        // Observe elements for animation
        const animateElements = document.querySelectorAll(`
            .about-card, .case-card, 
            .contact-item, .stat
        `);
        
        animateElements.forEach(el => observer.observe(el));
    }

    /** Setup interactive services showcase */
    setupServices() {
        const serviceButtons = document.querySelectorAll('.service-btn');
        const serviceContents = document.querySelectorAll('.service-content');

        // Service button click handler
        serviceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetService = button.dataset.service;
                this.switchService(targetService, serviceButtons, serviceContents);
            });
        });

        // Handle direct service links (from footer, etc.)
        this.handleDirectServiceLinks(serviceButtons, serviceContents);
    }

    /** Switch to specific service panel */
    switchService(targetService, serviceButtons, serviceContents) {
        // Remove active class from all buttons and contents
        serviceButtons.forEach(btn => btn.classList.remove('active'));
        serviceContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to corresponding button and content
        const targetButton = document.querySelector(`[data-service="${targetService}"]`);
        const targetContent = document.getElementById(`service-${targetService}`);
        
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) {
            setTimeout(() => {
                targetContent.classList.add('active');
            }, 100);
        }
    }

    /** Handle direct service links */
    handleDirectServiceLinks(serviceButtons, serviceContents) {
        // Map service IDs to service types
        const serviceMap = {
            'website-dev': 'website',
            'software-dev': 'software', 
            'ecommerce-dev': 'ecommerce',
            'miniapp-dev': 'miniapp'
        };

        // Check URL hash on page load
        const hash = window.location.hash.slice(1);
        if (serviceMap[hash]) {
            setTimeout(() => {
                this.switchService(serviceMap[hash], serviceButtons, serviceContents);
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }

        // Handle nav links to specific services
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                const targetId = link.getAttribute('href').slice(1);
                if (serviceMap[targetId]) {
                    e.preventDefault();
                    this.switchService(serviceMap[targetId], serviceButtons, serviceContents);
                    setTimeout(() => {
                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                }
            }
        });
    }
}

/** Utility function for smooth scrolling */
function scrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/** Add ripple effect to buttons */
function addRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;

    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to { transform: scale(2); opacity: 0; }
        }
    `;
    if (!document.head.querySelector('style[data-ripple]')) {
        style.dataset.ripple = 'true';
        document.head.appendChild(style);
    }

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

/** Initialize app when DOM is loaded */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    new App();

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', addRipple);
    });

    // Add smooth hover effects to cards
    document.querySelectorAll('.case-card, .about-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add typing effect to hero text
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        setTimeout(() => {
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.innerHTML = text.slice(0, i + 1);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };
            typeWriter();
        }, 1000);
    }

    // Performance optimization - reduce animations on mobile
    if (window.innerWidth < 768) {
        document.documentElement.style.setProperty('--transition-slow', '0.2s ease');
        document.documentElement.style.setProperty('--transition-medium', '0.15s ease');
    }

    // Disable animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-fast', '0.01ms');
        document.documentElement.style.setProperty('--transition-medium', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    }
});

/** Export for module systems */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, scrollTo, addRipple };
}