class ResponsiveImageManager {
	constructor() {
		this.images = document.querySelectorAll('img[data-src], img[src*="images/"]');
		this.imageObserver = null;
		this.init();
	}

	init() {
		this.setupLazyLoading();
		this.setupResponsiveImages();
		this.setupImageOptimization();
	}

	setupLazyLoading() {
		const options = {
			root: null,
			rootMargin: '50px',
			threshold: 0.1
		};

		this.imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					this.loadImage(img);
					observer.unobserve(img);
				}
			});
		}, options);

		this.images.forEach(img => {
			if (img.dataset.src) {
				this.imageObserver.observe(img);
			}
		});
	}

	loadImage(img) {
		const src = img.dataset.src || img.src;
		if (src && img.dataset.src) {

			img.src = img.dataset.src;
			img.addEventListener('load', () => {
				img.classList.add('loaded');
				img.removeAttribute('data-src');
			});

			img.addEventListener('error', () => {
				img.classList.add('error');
				console.warn(`Failed to load image: ${src}`);
			});
		} else if (img.src) {

			img.classList.add('loaded');
		}
	}

	setupResponsiveImages() {
		const updateImageSizes = () => {
			const screenWidth = window.innerWidth;

			this.images.forEach(img => {
				if (img.dataset.responsive) {
					const baseSrc = img.dataset.responsive;
					let sizeSuffix = '';

					if (screenWidth <= 480) {
						sizeSuffix = '_mobile';
					} else if (screenWidth <= 768) {
						sizeSuffix = '_tablet';
					} else if (screenWidth <= 1024) {
						sizeSuffix = '_desktop';
					} else {
						sizeSuffix = '_large';
					}

					const newSrc = `${baseSrc}${sizeSuffix}.jpg`;
					if (img.src !== newSrc && img.complete) {
						img.src = newSrc;
					}
				}
			});
		};

		updateImageSizes();

		let resizeTimeout;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updateImageSizes, 250);
		});
	}

	setupImageOptimization() {

	}

	checkWebPSupport() {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
	}

	preloadCriticalImages() {
		const criticalImages = document.querySelectorAll('img[data-critical]');
		criticalImages.forEach(img => {
			const src = img.dataset.src;
			if (src) {
				const preloadImg = new Image();
				preloadImg.src = src;
			}
		});
	}
}

class PageLoader {
	constructor() {
		this.init();
	}

	init() {

		if (!document.querySelector('.page-loader')) {
			this.createLoader();
		}

		window.addEventListener('load', () => {
			setTimeout(() => {
				this.hideLoader();
				this.initAnimations();
			}, 800);
		});
	}

	createLoader() {
		const loader = document.createElement('div');
		loader.className = 'page-loader';
		loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">加载中...</div>
            </div>
        `;
		document.body.appendChild(loader);
	}

	hideLoader() {
		const pageLoader = document.querySelector('.page-loader');
		if (pageLoader) {
			pageLoader.classList.add('fade-out');
			setTimeout(() => {
				pageLoader.remove();
			}, 500);
		}
	}

	initAnimations() {
		const animatedElements = document.querySelectorAll('[class*="animate-"], .service-card, .case-card, .contact-item');

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.style.opacity = '1';
						entry.target.style.transform = 'translateY(0)';
						observer.unobserve(entry.target);
					}
				});
			}, {
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px'
			});

			animatedElements.forEach(element => {
				element.style.opacity = '0';
				element.style.transform = 'translateY(30px)';
				element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
				observer.observe(element);
			});
		}
	}
}

class Navigation {
	constructor() {
		this.scrolled = false;
		this.navbar = document.querySelector('.navbar');
		this.navToggle = document.querySelector('.nav-toggle');
		this.navMenu = document.querySelector('.nav-menu');
		this.navLinks = document.querySelectorAll('.nav-link');
		this.init();
	}

	init() {
		this.setupMobileToggle();
		this.setupSmoothScrolling();
		this.setupActiveNavLink();
		this.setupScrollEffect();
	}

	setupMobileToggle() {
		if (this.navToggle && this.navMenu) {

			this.navToggle.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.toggleMobileMenu();
			});

			this.navToggle.addEventListener('touchstart', (e) => {
				this.toggleMobileMenu();
			}, {
				passive: true
			});

			this.navLinks.forEach(link => {
				link.addEventListener('click', () => {
					this.closeMobileMenu();
				});

				link.addEventListener('touchstart', () => {
					link.style.backgroundColor = 'var(--bg-card-hover)';
				});

				link.addEventListener('touchend', () => {
					setTimeout(() => {
						link.style.backgroundColor = '';
					}, 150);
				});
			});

			document.addEventListener('click', (e) => {
				if (!this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
					this.closeMobileMenu();
				}
			});

			this.setupSwipeGesture();

			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
					this.closeMobileMenu();
				}
			});
		}
	}

	toggleMobileMenu() {
		const isActive = this.navMenu.classList.contains('active');

		if (isActive) {
			this.closeMobileMenu();
		} else {
			this.openMobileMenu();
		}
	}

	openMobileMenu() {
		this.navMenu.classList.add('active');
		this.navToggle.classList.add('active');
		document.body.style.overflow = 'hidden';
		this.animateNavLinks();
	}

	closeMobileMenu() {
		this.navMenu.classList.remove('active');
		this.navToggle.classList.remove('active');
		document.body.style.overflow = '';
	}

	setupSwipeGesture() {
		let startX = 0;
		let startY = 0;

		this.navMenu.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
		});

		this.navMenu.addEventListener('touchmove', (e) => {
			if (!startX || !startY) return;

			const currentX = e.touches[0].clientX;
			const currentY = e.touches[0].clientY;
			const diffX = startX - currentX;
			const diffY = startY - currentY;

			if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
				this.closeMobileMenu();
				startX = 0;
				startY = 0;
			}
		});
	}

	animateNavLinks() {
		this.navLinks.forEach((link, index) => {
			link.style.opacity = '0';
			link.style.transform = 'translateY(-20px)';
			setTimeout(() => {
				link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
				link.style.opacity = '1';
				link.style.transform = 'translateY(0)';
			}, index * 100);
		});
	}

	setupSmoothScrolling() {
		this.navLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				const href = link.getAttribute('href');

				if (href.startsWith('#')) {
					e.preventDefault();
					const targetId = href.substring(1);
					const targetElement = document.getElementById(targetId);

					if (targetElement) {
						const headerHeight = this.navbar ? this.navbar.offsetHeight : 80;
						const targetPosition = targetElement.offsetTop - headerHeight;

						window.scrollTo({
							top: targetPosition,
							behavior: 'smooth'
						});
					}
				}
			});
		});
	}

	setupScrollEffect() {
		window.addEventListener('scroll', () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

			if (this.navbar) {
				this.navbar.style.position = 'fixed';
				this.navbar.style.top = '0';
				this.navbar.style.zIndex = '9999';
				this.navbar.style.width = '100%';
			}

			if (scrollTop > 50 && !this.scrolled) {
				this.navbar?.classList.add('scrolled');
				this.scrolled = true;
			} else if (scrollTop <= 50 && this.scrolled) {
				this.navbar?.classList.remove('scrolled');
				this.scrolled = false;
			}
		});

		if (this.navbar) {
			this.navbar.style.position = 'fixed';
			this.navbar.style.top = '0';
			this.navbar.style.zIndex = '9999';
			this.navbar.style.width = '100%';
		}
	}

	setupActiveNavLink() {
		const sections = document.querySelectorAll('section[id]');

		if (sections.length === 0) return;

		const observerOptions = {
			rootMargin: '-80px 0px -50% 0px',
			threshold: 0
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const currentId = entry.target.getAttribute('id');
					this.updateActiveNavLink(currentId);
				}
			});
		}, observerOptions);

		sections.forEach(section => {
			observer.observe(section);
		});
	}

	updateActiveNavLink(activeId) {
		this.navLinks.forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('href') === `#${activeId}`) {
				link.classList.add('active');
			}
		});
	}
}

class FormHandler {
	constructor() {
		this.contactForm = document.querySelector('.contact-form');
		this.init();
	}

	init() {
		if (this.contactForm) {
			this.setupFormValidation();
			this.setupFormSubmission();
		}
	}

	setupFormValidation() {
		const inputs = this.contactForm.querySelectorAll('input, textarea');

		inputs.forEach(input => {
			input.addEventListener('blur', () => {
				this.validateField(input);
			});

			input.addEventListener('input', () => {
				this.clearFieldError(input);
			});
		});
	}

	validateField(field) {
		const value = field.value.trim();
		let isValid = true;
		let errorMessage = '';

		this.clearFieldError(field);

		if (field.hasAttribute('required') && !value) {
			isValid = false;
			errorMessage = '此字段为必填项';
		}

		if (field.type === 'email' && value) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				isValid = false;
				errorMessage = '请输入有效的邮箱地址';
			}
		}

		if (!isValid) {
			this.showFieldError(field, errorMessage);
		}

		return isValid;
	}

	showFieldError(field, message) {
		field.style.borderColor = 'var(--accent-tertiary)';

		const existingError = field.parentNode.querySelector('.error-message');
		if (existingError) {
			existingError.remove();
		}

		const errorElement = document.createElement('span');
		errorElement.className = 'error-message';
		errorElement.textContent = message;
		errorElement.style.cssText = `
            color: var(--accent-tertiary);
            font-size: 0.8rem;
            margin-top: 0.5rem;
            display: block;
        `;
		field.parentNode.appendChild(errorElement);
	}

	clearFieldError(field) {
		field.style.borderColor = '';
		const errorMessage = field.parentNode.querySelector('.error-message');
		if (errorMessage) {
			errorMessage.remove();
		}
	}

	setupFormSubmission() {
		this.contactForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const formData = new FormData(this.contactForm);
			const isValid = this.validateForm();

			if (isValid) {
				this.submitForm(formData);
			}
		});
	}

	validateForm() {
		const inputs = this.contactForm.querySelectorAll('input, textarea');
		let isValid = true;

		inputs.forEach(input => {
			if (!this.validateField(input)) {
				isValid = false;
			}
		});

		return isValid;
	}

	async submitForm(formData) {
		const submitButton = this.contactForm.querySelector('button[type="submit"]');
		const originalText = submitButton.textContent;

		try {
			submitButton.textContent = '发送中...';
			submitButton.disabled = true;

			await new Promise(resolve => setTimeout(resolve, 2000));

			this.showMessage('消息发送成功！我们会尽快回复您。', 'success');
			this.contactForm.reset();

		} catch (error) {
			console.error('Form submission error:', error);
			this.showMessage('发送失败，请稍后重试。', 'error');
		} finally {
			submitButton.textContent = originalText;
			submitButton.disabled = false;
		}
	}

	showMessage(message, type = 'info') {
		const existingMessage = document.querySelector('.form-message');
		if (existingMessage) {
			existingMessage.remove();
		}

		const messageElement = document.createElement('div');
		messageElement.className = `form-message ${type}`;
		messageElement.textContent = message;

		messageElement.style.cssText = `
            padding: 1rem;
            border-radius: var(--border-radius-md);
            margin-top: 1rem;
            text-align: center;
            font-weight: var(--font-weight-medium);
            ${type === 'success' 
                ? 'background: rgba(0, 255, 136, 0.1); color: var(--accent-primary); border: 1px solid var(--accent-primary);'
                : 'background: rgba(255, 107, 107, 0.1); color: var(--accent-tertiary); border: 1px solid var(--accent-tertiary);'
            }
        `;

		this.contactForm.appendChild(messageElement);

		setTimeout(() => {
			if (messageElement.parentNode) {
				messageElement.remove();
			}
		}, 4000);
	}
}

class ParticleBackground {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.particles = [];
		this.init();
	}

	init() {
		this.createCanvas();
		this.createParticles();
		this.animate();
		this.setupResize();
	}

	createCanvas() {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'particles-canvas';
		this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.3;
            pointer-events: none;
        `;

		document.body.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.resize();
	}

	createParticles() {
		const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));

		for (let i = 0; i < particleCount; i++) {
			this.particles.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				size: Math.random() * 3 + 1,
				speedX: (Math.random() - 0.5) * 0.5,
				speedY: (Math.random() - 0.5) * 0.5,
				opacity: Math.random() * 0.5 + 0.2
			});
		}
	}

	animate() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.particles.forEach(particle => {
			particle.x += particle.speedX;
			particle.y += particle.speedY;

			if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
			if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

			this.ctx.beginPath();
			this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
			this.ctx.fill();
		});

		requestAnimationFrame(() => this.animate());
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	setupResize() {
		window.addEventListener('resize', () => {
			this.resize();
		});
	}
}

class PerformanceOptimizer {
	constructor() {
		this.init();
	}

	init() {
		this.setupIntersectionObserver();
		this.setupLazyLoading();
		this.preloadCriticalResources();
	}

	setupIntersectionObserver() {
		const elements = document.querySelectorAll('.service-card, .case-card');

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, {
			threshold: 0.1
		});

		elements.forEach(element => {
			observer.observe(element);
		});
	}

	setupLazyLoading() {
		const images = document.querySelectorAll('img[data-src]');

		const imageObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					img.src = img.dataset.src;
					img.removeAttribute('data-src');
					imageObserver.unobserve(img);
				}
			});
		});

		images.forEach(img => imageObserver.observe(img));
	}

	preloadCriticalResources() {
		const criticalFonts = [
			'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
		];

		criticalFonts.forEach(font => {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'style';
			link.href = font;
			document.head.appendChild(link);
		});
	}
}

class App {
	constructor() {
		this.init();
	}

	init() {

		this.checkSupport();

		new PageLoader();
		new Navigation();
		new FormHandler();
		new ResponsiveImageManager();
		new PerformanceOptimizer();

		if (!this.isMobile()) {
			new ParticleBackground();
		}

		this.setupGlobalListeners();
	}

	checkSupport() {

		if (!window.IntersectionObserver) {
			console.warn('IntersectionObserver not supported, using fallback');
		}

		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = window.setTimeout;
		}
	}

	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			window.innerWidth < 768;
	}

	setupGlobalListeners() {

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				const activeMenu = document.querySelector('.nav-menu.active');
				if (activeMenu) {
					activeMenu.classList.remove('active');
					document.querySelector('.nav-toggle')?.classList.remove('active');
				}
			}
		});

		this.createScrollToTopButton();
	}

	createScrollToTopButton() {
		const scrollBtn = document.createElement('button');
		scrollBtn.innerHTML = '↑';
		scrollBtn.className = 'scroll-to-top';
		scrollBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--gradient-primary);
            color: var(--color-black);
            border: none;
            font-size: 1.2rem;
            font-weight: bold;
            opacity: 0;
            transform: scale(0);
            transition: var(--transition-smooth);
            z-index: var(--z-fixed);
            cursor: pointer;
        `;

		scrollBtn.addEventListener('click', () => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		});

		document.body.appendChild(scrollBtn);

		window.addEventListener('scroll', () => {
			if (window.pageYOffset > 300) {
				scrollBtn.style.opacity = '1';
				scrollBtn.style.transform = 'scale(1)';
			} else {
				scrollBtn.style.opacity = '0';
				scrollBtn.style.transform = 'scale(0)';
			}
		});
	}
}

class SelectHandler {
	constructor() {
		this.selects = document.querySelectorAll('.custom-select');
		this.init();
	}

	init() {
		this.setupSelectEnhancements();
		this.setupKeyboardNavigation();
		this.setupAccessibility();
	}

	setupSelectEnhancements() {
		this.selects.forEach(select => {

			select.addEventListener('focus', (e) => {
				this.handleSelectFocus(e.target);
			});

			select.addEventListener('blur', (e) => {
				this.handleSelectBlur(e.target);
			});

			select.addEventListener('change', (e) => {
				this.handleSelectChange(e.target);
			});

			if ('ontouchstart' in window) {
				select.addEventListener('touchstart', () => {
					select.classList.add('touch-active');
				});
			}
		});
	}

	handleSelectFocus(select) {
		const wrapper = select.closest('.custom-select-wrapper');
		const icon = wrapper.querySelector('.select-icon');

		wrapper.classList.add('focused');
		if (icon) {
			icon.style.transform = 'translateY(-50%) rotate(180deg) scale(1.1)';
		}

		select.style.animation = 'selectPulse 0.3s ease-out';
	}

	handleSelectBlur(select) {
		const wrapper = select.closest('.custom-select-wrapper');
		const icon = wrapper.querySelector('.select-icon');

		wrapper.classList.remove('focused');
		if (icon) {
			icon.style.transform = 'translateY(-50%) rotate(0deg) scale(1)';
		}

		select.style.animation = '';
	}

	handleSelectChange(select) {

		const wrapper = select.closest('.custom-select-wrapper');
		wrapper.classList.add('changed');

		this.createRippleEffect(select);

		setTimeout(() => {
			wrapper.classList.remove('changed');
		}, 300);
	}

	createRippleEffect(element) {
		const rect = element.getBoundingClientRect();
		const ripple = document.createElement('div');
		ripple.className = 'select-ripple';

		const size = Math.max(rect.width, rect.height);
		ripple.style.width = ripple.style.height = size + 'px';
		ripple.style.left = '50%';
		ripple.style.top = '50%';
		ripple.style.transform = 'translate(-50%, -50%) scale(0)';

		element.parentNode.appendChild(ripple);

		requestAnimationFrame(() => {
			ripple.style.transform = 'translate(-50%, -50%) scale(1)';
			ripple.style.opacity = '0';
		});

		setTimeout(() => {
			if (ripple.parentNode) {
				ripple.parentNode.removeChild(ripple);
			}
		}, 600);
	}

	setupKeyboardNavigation() {
		this.selects.forEach(select => {
			select.addEventListener('keydown', (e) => {

				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					select.click();
				}
			});
		});
	}

	setupAccessibility() {
		this.selects.forEach(select => {

			select.setAttribute('role', 'combobox');
			select.setAttribute('aria-haspopup', 'listbox');

			const label = select.closest('.form-group').querySelector('label');
			if (label) {
				const labelId = label.id || `label-${Date.now()}`;
				label.id = labelId;
				select.setAttribute('aria-labelledby', labelId);
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new App();
	new SelectHandler();
});

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		App,
		Navigation,
		FormHandler,
		ParticleBackground,
		SelectHandler
	};
}