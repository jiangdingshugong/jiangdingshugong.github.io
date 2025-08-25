class PerformanceMonitor {
	constructor() {
		this.metrics = {};
		this.init();
	}

	init() {
		this.startTiming('pageLoad');
		this.measureFCP();
		this.measureLCP();

		window.addEventListener('load', () => {
			this.endTiming('pageLoad');
			this.reportMetrics();
		});
	}

	startTiming(label) {
		this.metrics[label] = {
			start: performance.now()
		};
	}

	endTiming(label) {
		if (this.metrics[label]) {
			this.metrics[label].end = performance.now();
			this.metrics[label].duration = this.metrics[label].end - this.metrics[label].start;
		}
	}

	measureFCP() {
		if ('PerformanceObserver' in window) {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach(entry => {
					if (entry.name === 'first-contentful-paint') {
						this.metrics.fcp = entry.startTime;
					}
				});
			});
			observer.observe({
				entryTypes: ['paint']
			});
		}
	}

	measureLCP() {
		if ('PerformanceObserver' in window) {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1];
				this.metrics.lcp = lastEntry.startTime;
			});
			observer.observe({
				entryTypes: ['largest-contentful-paint']
			});
		}
	}

	reportMetrics() {
		console.log('Performance Metrics:', this.metrics);
	}
}

class LazyLoadManager {
	constructor() {
		this.imageObserver = null;
		this.contentObserver = null;
		this.init();
	}

	init() {
		this.setupImageLazyLoading();
		this.setupContentLazyLoading();
		this.setupVideoLazyLoading();
	}

	setupImageLazyLoading() {
		const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');

		if ('IntersectionObserver' in window) {
			this.imageObserver = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.loadImage(entry.target);
						this.imageObserver.unobserve(entry.target);
					}
				});
			}, {
				rootMargin: '50px 0px',
				threshold: 0.01
			});

			images.forEach(img => {

				if (img.dataset.src && !img.src) {
					img.src = this.generatePlaceholder(img.offsetWidth || 300, img.offsetHeight || 200);
					img.style.filter = 'blur(5px)';
					img.style.transition = 'filter 0.3s ease';
				}
				this.imageObserver.observe(img);
			});
		} else {

			images.forEach(img => this.loadImage(img));
		}
	}

	loadImage(img) {
		const src = img.dataset.src || img.src;

		const imageLoader = new Image();
		imageLoader.onload = () => {
			img.src = src;
			img.style.filter = 'none';
			img.classList.add('lazy-loaded');
			img.removeAttribute('data-src');
		};
		imageLoader.onerror = () => {
			img.src = this.generateErrorPlaceholder();
			img.classList.add('lazy-error');
		};
		imageLoader.src = src;
	}

	setupContentLazyLoading() {
		const lazyContent = document.querySelectorAll('[data-lazy-component]');

		if (lazyContent.length > 0) {
			this.contentObserver = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.loadComponent(entry.target);
						this.contentObserver.unobserve(entry.target);
					}
				});
			}, {
				rootMargin: '100px 0px',
				threshold: 0.1
			});

			lazyContent.forEach(element => {
				this.contentObserver.observe(element);
			});
		}
	}

	setupVideoLazyLoading() {
		const videos = document.querySelectorAll('video[data-src]');

		if (videos.length > 0) {
			const videoObserver = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const video = entry.target;
						video.src = video.dataset.src;
						video.load();
						video.removeAttribute('data-src');
						videoObserver.unobserve(video);
					}
				});
			});

			videos.forEach(video => videoObserver.observe(video));
		}
	}

	loadComponent(element) {
		const componentName = element.dataset.lazyComponent;

		element.innerHTML = '<div class="loading-placeholder">加载中...</div>';

		import(`./components/${componentName}.js`)
			.then(module => {
				const Component = module.default;
				new Component(element);
			})
			.catch(() => {
				element.innerHTML = '<div class="error-placeholder">加载失败</div>';
			});
	}

	generatePlaceholder(width, height) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');

		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, '#f0f0f0');
		gradient.addColorStop(1, '#e0e0e0');

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		return canvas.toDataURL();
	}

	generateErrorPlaceholder() {
		return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">图片加载失败</text>
            </svg>
        `);
	}
}

class ModuleManager {
	constructor() {
		this.loadedModules = new Set();
		this.moduleCache = new Map();
		this.init();
	}

	init() {
		this.setupConditionalLoading();
		this.setupFeatureDetection();
	}

	async loadModule(moduleName, condition = true) {
		if (!condition || this.loadedModules.has(moduleName)) {
			return;
		}

		try {
			let module;

			if (this.moduleCache.has(moduleName)) {
				module = this.moduleCache.get(moduleName);
			} else {

				module = await this.dynamicImport(moduleName);
				this.moduleCache.set(moduleName, module);
			}

			this.loadedModules.add(moduleName);

			if (module.init && typeof module.init === 'function') {
				module.init();
			}

			return module;
		} catch (error) {
			console.error(`Failed to load module: ${moduleName}`, error);
		}
	}

	async dynamicImport(moduleName) {
		const moduleMap = {
			'particles': () => import('./modules/particles.js'),
			'charts': () => import('./modules/charts.js'),
			'animation': () => import('./modules/animation.js'),
			'contact': () => import('./modules/contact.js')
		};

		if (moduleMap[moduleName]) {
			const module = await moduleMap[moduleName]();
			return module.default || module;
		}

		throw new Error(`Module ${moduleName} not found`);
	}

	setupConditionalLoading() {

		const servicesSection = document.querySelector('#services');
		if (servicesSection) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.loadModule('animation');
						observer.unobserve(entry.target);
					}
				});
			});
			observer.observe(servicesSection);
		}

		const contactButtons = document.querySelectorAll('a[href="#contact"]');
		contactButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				this.loadModule('contact');
			}, {
				once: true
			});
		});
	}

	setupFeatureDetection() {
		const features = {
			intersectionObserver: 'IntersectionObserver' in window,
			webGL: this.checkWebGLSupport(),
			touchDevice: 'ontouchstart' in window,
			reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
		};

		if (features.webGL && !features.touchDevice && !features.reducedMotion) {
			this.loadModule('particles');
		}

		if (features.intersectionObserver) {
			this.loadModule('animation');
		}
	}

	checkWebGLSupport() {
		try {
			const canvas = document.createElement('canvas');
			return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
		} catch (e) {
			return false;
		}
	}
}

class AnimationController {
	constructor() {
		this.animations = new Map();
		this.rafId = null;
		this.isRunning = false;
		this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.init();
	}

	init() {
		this.setupScrollAnimations();
		this.setupHoverEffects();
		this.setupClickAnimations();
		this.setupParallaxEffects();
	}

	setupScrollAnimations() {
		const animatedElements = document.querySelectorAll('.animate-on-scroll, .service-card, .case-card');

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.triggerAnimation(entry.target, 'fadeInUp');
						observer.unobserve(entry.target);
					}
				});
			}, {
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px'
			});

			animatedElements.forEach((element, index) => {

				element.style.setProperty('--animation-delay', `${index * 0.1}s`);
				observer.observe(element);
			});
		}
	}

	setupHoverEffects() {
		const hoverElements = document.querySelectorAll('.hover-glow, .btn, .service-card, .case-card');

		hoverElements.forEach(element => {
			let hoverAnimation = null;

			element.addEventListener('mouseenter', () => {
				if (this.reducedMotion) return;

				hoverAnimation = this.createHoverEffect(element);
				element.style.transform = 'translateY(-5px) scale(1.02)';
				element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
			});

			element.addEventListener('mouseleave', () => {
				if (hoverAnimation) {
					hoverAnimation.cancel();
				}
				element.style.transform = '';
				element.style.boxShadow = '';
			});
		});
	}

	setupClickAnimations() {
		const clickElements = document.querySelectorAll('.btn, button, a');

		clickElements.forEach(element => {
			element.addEventListener('click', (e) => {
				if (this.reducedMotion) return;

				this.createRippleEffect(e);
				this.triggerClickAnimation(element);
			});
		});
	}

	setupParallaxEffects() {
		const parallaxElements = document.querySelectorAll('.parallax-element, .hero-visual');

		if (parallaxElements.length > 0 && !this.reducedMotion) {
			let ticking = false;

			const updateParallax = () => {
				const scrollTop = window.pageYOffset;

				parallaxElements.forEach((element, index) => {
					const speed = 0.5 + (index * 0.1);
					const transform = `translateY(${scrollTop * speed}px) translateZ(0)`;
					element.style.transform = transform;
				});

				ticking = false;
			};

			window.addEventListener('scroll', () => {
				if (!ticking) {
					requestAnimationFrame(updateParallax);
					ticking = true;
				}
			});
		}
	}

	triggerAnimation(element, animationType) {
		if (this.reducedMotion) {
			element.style.opacity = '1';
			return;
		}

		const animations = {
			fadeInUp: [{
					opacity: 0,
					transform: 'translateY(30px)'
				},
				{
					opacity: 1,
					transform: 'translateY(0)'
				}
			],
			fadeInLeft: [{
					opacity: 0,
					transform: 'translateX(-30px)'
				},
				{
					opacity: 1,
					transform: 'translateX(0)'
				}
			],
			fadeInRight: [{
					opacity: 0,
					transform: 'translateX(30px)'
				},
				{
					opacity: 1,
					transform: 'translateX(0)'
				}
			],
			scaleIn: [{
					opacity: 0,
					transform: 'scale(0.8)'
				},
				{
					opacity: 1,
					transform: 'scale(1)'
				}
			]
		};

		const keyframes = animations[animationType] || animations.fadeInUp;
		const delay = parseFloat(element.style.getPropertyValue('--animation-delay')) || 0;

		setTimeout(() => {
			const animation = element.animate(keyframes, {
				duration: 800,
				easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				fill: 'forwards'
			});

			this.animations.set(element, animation);
		}, delay * 1000);
	}

	createHoverEffect(element) {
		return element.animate([{
				transform: 'translateY(0) scale(1)'
			},
			{
				transform: 'translateY(-2px) scale(1.01)'
			},
			{
				transform: 'translateY(-5px) scale(1.02)'
			}
		], {
			duration: 300,
			easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fill: 'forwards'
		});
	}

	triggerClickAnimation(element) {
		const animation = element.animate([{
				transform: 'scale(1)'
			},
			{
				transform: 'scale(0.95)'
			},
			{
				transform: 'scale(1)'
			}
		], {
			duration: 150,
			easing: 'ease-out'
		});

		return animation;
	}

	createRippleEffect(event) {
		const button = event.currentTarget;
		const rect = button.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height);
		const x = event.clientX - rect.left - size / 2;
		const y = event.clientY - rect.top - size / 2;

		const ripple = document.createElement('span');
		ripple.className = 'ripple-effect';
		ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 255, 136, 0.6) 0%, rgba(0, 212, 255, 0.4) 50%, transparent 70%);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;

		if (getComputedStyle(button).position === 'static') {
			button.style.position = 'relative';
		}
		button.style.overflow = 'hidden';

		button.appendChild(ripple);

		setTimeout(() => {
			ripple.remove();
		}, 600);
	}

	pauseAllAnimations() {
		this.animations.forEach(animation => {
			animation.pause();
		});
	}

	resumeAllAnimations() {
		this.animations.forEach(animation => {
			animation.play();
		});
	}
}

class CacheManager {
	constructor() {
		this.cache = new Map();
		this.maxSize = 50;
		this.init();
	}

	init() {
		this.setupImageCache();
		this.setupDataCache();
		this.setupServiceWorker();
	}

	setupImageCache() {
		const images = document.querySelectorAll('img');

		images.forEach(img => {
			img.addEventListener('load', () => {
				this.cacheImage(img.src);
			});
		});
	}

	cacheImage(src) {
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}

		this.cache.set(src, {
			type: 'image',
			timestamp: Date.now()
		});
	}

	setupDataCache() {

		this.originalFetch = window.fetch;
		window.fetch = this.cachingFetch.bind(this);
	}

	async cachingFetch(url, options = {}) {
		const cacheKey = `${url}_${JSON.stringify(options)}`;

		if (this.cache.has(cacheKey)) {
			const cached = this.cache.get(cacheKey);
			if (Date.now() - cached.timestamp < 300000) {
				return new Response(JSON.stringify(cached.data));
			}
		}

		try {
			const response = await this.originalFetch(url, options);
			const data = await response.clone().json();

			this.cache.set(cacheKey, {
				type: 'api',
				data: data,
				timestamp: Date.now()
			});

			return response;
		} catch (error) {
			console.error('Fetch error:', error);
			throw error;
		}
	}

	setupServiceWorker() {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js')
				.then(registration => {
					console.log('SW registered:', registration);
				})
				.catch(error => {
					console.log('SW registration failed:', error);
				});
		}
	}
}

class ResponsiveImageManager {
	constructor() {
		this.breakpoints = {
			mobile: 480,
			tablet: 768,
			desktop: 1024,
			large: 1440
		};
		this.init();
	}

	init() {
		this.setupResponsiveImages();
		this.setupResizeHandler();
	}

	setupResponsiveImages() {
		const images = document.querySelectorAll('img[data-responsive]');

		images.forEach(img => {
			this.updateImageSource(img);
		});
	}

	updateImageSource(img) {
		const baseUrl = img.dataset.responsive;
		const currentBreakpoint = this.getCurrentBreakpoint();

		const responsiveUrl = `${baseUrl}_${currentBreakpoint}.jpg`;

		if (img.src !== responsiveUrl) {
			img.src = responsiveUrl;
		}
	}

	getCurrentBreakpoint() {
		const width = window.innerWidth;

		if (width <= this.breakpoints.mobile) return 'mobile';
		if (width <= this.breakpoints.tablet) return 'tablet';
		if (width <= this.breakpoints.desktop) return 'desktop';
		return 'large';
	}

	setupResizeHandler() {
		let resizeTimer;

		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				const images = document.querySelectorAll('img[data-responsive]');
				images.forEach(img => this.updateImageSource(img));
			}, 250);
		});
	}
}

class OptimizedApp {
	constructor() {
		this.modules = new Map();
		this.performanceMonitor = new PerformanceMonitor();
		this.init();
	}

	async init() {

		this.loadCriticalModules();

		this.scheduleNonCriticalModules();

		this.setupPerformanceMonitoring();
	}

	loadCriticalModules() {

		this.modules.set('lazyload', new LazyLoadManager());
		this.modules.set('animation', new AnimationController());
	}

	scheduleNonCriticalModules() {

		if ('requestIdleCallback' in window) {
			requestIdleCallback(() => {
				this.loadNonCriticalModules();
			});
		} else {
			setTimeout(() => {
				this.loadNonCriticalModules();
			}, 1000);
		}
	}

	loadNonCriticalModules() {
		this.modules.set('moduleManager', new ModuleManager());
		this.modules.set('cache', new CacheManager());
		this.modules.set('responsiveImages', new ResponsiveImageManager());
	}

	setupPerformanceMonitoring() {

		window.addEventListener('load', () => {
			setTimeout(() => {
				this.performanceMonitor.reportMetrics();
			}, 1000);
		});

		['click', 'scroll', 'keydown'].forEach(eventType => {
			document.addEventListener(eventType, this.throttle(() => {

			}, 100));
		});
	}

	throttle(func, limit) {
		let inThrottle;
		return function() {
			const args = arguments;
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, limit);
			}
		};
	}
}

const animationCSS = `

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.lazy-loaded {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.animate-on-scroll {
    will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;

const style = document.createElement('style');
style.textContent = animationCSS;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
	new OptimizedApp();
});

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		OptimizedApp,
		LazyLoadManager,
		ModuleManager,
		AnimationController,
		CacheManager
	};
}