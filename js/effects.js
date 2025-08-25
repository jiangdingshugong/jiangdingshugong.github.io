class Website {
	constructor() {
		this.init();
	}

	init() {
		this.setupCustomCursor();
		this.setupMagneticElements();
		this.setupScrollReveal();
		this.setupParticleEffects();
		this.setupHolographicText();
		this.setupAnimations();
		this.setupPerformanceOptimizations();
		this.setupAuroraBackground();
		this.setupFloatingElements();
	}

	setupCustomCursor() {

		const cursor = document.createElement('div');
		cursor.className = 'custom-cursor';
		document.body.appendChild(cursor);

		let mouseX = 0,
			mouseY = 0;
		let cursorX = 0,
			cursorY = 0;

		document.addEventListener('mousemove', (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		const animateCursor = () => {
			const ease = 0.6;
			cursorX += (mouseX - cursorX) * ease;
			cursorY += (mouseY - cursorY) * ease;

			cursor.style.left = (cursorX - 10) + 'px';
			cursor.style.top = (cursorY - 10) + 'px';

			requestAnimationFrame(animateCursor);
		};
		animateCursor();

		const interactiveElements = document.querySelectorAll('a, button, .interactive');
		interactiveElements.forEach(element => {
			element.addEventListener('mouseenter', () => {
				cursor.classList.add('hover');
			});
			element.addEventListener('mouseleave', () => {
				cursor.classList.remove('hover');
			});
		});
	}

	setupMagneticElements() {
		const magneticElements = document.querySelectorAll('.magnetic-element, .btn, .card');

		magneticElements.forEach(element => {
			element.addEventListener('mousemove', (e) => {
				const rect = element.getBoundingClientRect();
				const x = e.clientX - rect.left - rect.width / 2;
				const y = e.clientY - rect.top - rect.height / 2;

				const strength = 0.3;
				const translateX = x * strength;
				const translateY = y * strength;

				element.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.05)`;
			});

			element.addEventListener('mouseleave', () => {
				element.style.transform = 'translate(0px, 0px) scale(1)';
			});
		});
	}

	setupScrollReveal() {
		const observerOptions = {
			threshold: 0.2,
			rootMargin: '0px 0px -50px 0px'
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('revealed');

					if (entry.target.dataset.delay) {
						setTimeout(() => {
							entry.target.classList.add('revealed');
						}, parseInt(entry.target.dataset.delay));
					}
				}
			});
		}, observerOptions);

		const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
		revealElements.forEach((element, index) => {
			element.dataset.delay = index * 100;
			observer.observe(element);
		});
	}

	setupParticleEffects() {
		const particlesContainer = document.getElementById('particles-js');
		if (!particlesContainer) return;

		for (let i = 0; i < 50; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';
			particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: ${['#00ff88', '#00d4ff', '#ff6b6b'][Math.floor(Math.random() * 3)]};
                border-radius: 50%;
                opacity: ${Math.random() * 0.5 + 0.3};
                animation: float-particle ${Math.random() * 20 + 10}s linear infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
            `;
			particlesContainer.appendChild(particle);
		}

		const style = document.createElement('style');
		style.textContent = `
            @keyframes float-particle {
                0% { transform: translateY(0) translateX(0) rotate(0deg); }
                25% { transform: translateY(-100px) translateX(50px) rotate(90deg); }
                50% { transform: translateY(-200px) translateX(-30px) rotate(180deg); }
                75% { transform: translateY(-100px) translateX(-70px) rotate(270deg); }
                100% { transform: translateY(0) translateX(0) rotate(360deg); }
            }
        `;
		document.head.appendChild(style);
	}

	setupHolographicText() {
		const holographicElements = document.querySelectorAll('.holographic-text, .hero-title .highlight');

		holographicElements.forEach(element => {
			element.classList.add('holographic-text');

			element.addEventListener('mouseenter', () => {
				this.triggerGlitchEffect(element);
			});
		});
	}

	triggerGlitchEffect(element) {
		element.style.animation = 'none';
		setTimeout(() => {
			element.style.animation = 'holographic-shift 4s ease-in-out infinite';
		}, 10);
	}

	setupAnimations() {

		window.addEventListener('scroll', () => {
			const scrolled = window.pageYOffset;
			const parallaxElements = document.querySelectorAll('.parallax');

			parallaxElements.forEach(element => {
				const speed = element.dataset.speed || 0.5;
				const yPos = -(scrolled * speed);
				element.style.transform = `translateY(${yPos}px)`;
			});
		});

		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', function(e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href'));
				if (target) {
					target.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
						inline: 'nearest'
					});
				}
			});
		});

		const buttons = document.querySelectorAll('.btn');
		buttons.forEach(button => {
			button.addEventListener('click', function(e) {

				const ripple = document.createElement('span');
				const rect = this.getBoundingClientRect();
				const size = Math.max(rect.width, rect.height);
				const x = e.clientX - rect.left - size / 2;
				const y = e.clientY - rect.top - size / 2;

				ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: radial-gradient(circle, rgba(0, 255, 136, 0.6) 0%, rgba(0, 212, 255, 0.4) 50%, transparent 70%);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

				this.style.position = 'relative';
				this.style.overflow = 'hidden';
				this.appendChild(ripple);

				setTimeout(() => {
					ripple.remove();
				}, 600);
			});
		});

		const rippleStyle = document.createElement('style');
		rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
		document.head.appendChild(rippleStyle);
	}

	setupAuroraBackground() {
		const aurora = document.createElement('div');
		aurora.className = 'aurora-bg';
		document.body.insertBefore(aurora, document.body.firstChild);

		let hue = 0;
		setInterval(() => {
			hue = (hue + 1) % 360;
			aurora.style.filter = `hue-rotate(${hue}deg)`;
		}, 100);
	}

	setupFloatingElements() {
		const floatingElements = document.querySelectorAll('.hero-image img');
		floatingElements.forEach(element => {
			element.classList.add('float-element');
		});

		for (let i = 0; i < 5; i++) {
			const shape = document.createElement('div');
			shape.style.cssText = `
                position: fixed;
                width: ${Math.random() * 100 + 50}px;
                height: ${Math.random() * 100 + 50}px;
                background: linear-gradient(45deg, rgba(0,255,136,0.1), rgba(0,212,255,0.1));
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-geometric ${Math.random() * 20 + 10}s infinite ease-in-out;
                pointer-events: none;
                z-index: -1;
            `;
			document.body.appendChild(shape);
		}
	}

	setupPerformanceOptimizations() {

		const animationObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('gpu-accelerated');
				} else {
					entry.target.classList.remove('gpu-accelerated');
				}
			});
		});

		const animatedElements = document.querySelectorAll('.animate-fade-in-left, .animate-fade-in-right, .animate-float');
		animatedElements.forEach(element => {
			animationObserver.observe(element);
		});

		let scrollTimer = null;
		window.addEventListener('scroll', () => {
			if (scrollTimer !== null) {
				clearTimeout(scrollTimer);
			}
			scrollTimer = setTimeout(() => {
				this.handleScroll();
			}, 16);
		});
	}

	handleScroll() {
		const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);

		const navbar = document.querySelector('.navbar');
		if (navbar) {
			if (window.pageYOffset > 100) {
				navbar.classList.add('navbar-scrolled');
			} else {
				navbar.classList.remove('navbar-scrolled');
			}
		}

		const parallaxElements = document.querySelectorAll('.hero-visual');
		parallaxElements.forEach(element => {
			const speed = 0.5;
			element.style.transform = `translateY(${window.pageYOffset * speed}px)`;
		});
	}

	setupMouseTrail() {
		const trail = [];
		const trailLength = 20;

		for (let i = 0; i < trailLength; i++) {
			const dot = document.createElement('div');
			dot.className = 'trail-dot';
			dot.style.cssText = `
                position: fixed;
                width: ${Math.max(1, trailLength - i)}px;
                height: ${Math.max(1, trailLength - i)}px;
                background: rgba(0, 255, 136, ${(trailLength - i) / trailLength});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transition: all 0.3s ease;
            `;
			document.body.appendChild(dot);
			trail.push({
				element: dot,
				x: 0,
				y: 0
			});
		}

		document.addEventListener('mousemove', (e) => {
			trail.forEach((dot, index) => {
				setTimeout(() => {
					dot.x = e.clientX;
					dot.y = e.clientY;
					dot.element.style.left = dot.x + 'px';
					dot.element.style.top = dot.y + 'px';
				}, index * 30);
			});
		});
	}

	setupTextScramble() {
		const scrambleElements = document.querySelectorAll('.hero-title, .section-title');

		scrambleElements.forEach(element => {
			element.addEventListener('mouseenter', () => {
				this.scrambleText(element);
			});
		});
	}

	scrambleText(element) {
		const originalText = element.textContent;
		const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
		let iteration = 0;

		const scramble = setInterval(() => {
			element.textContent = originalText
				.split('')
				.map((char, index) => {
					if (index < iteration) {
						return originalText[index];
					}
					return chars[Math.floor(Math.random() * chars.length)];
				})
				.join('');

			if (iteration >= originalText.length) {
				clearInterval(scramble);
				element.textContent = originalText;
			}

			iteration += 1 / 3;
		}, 30);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const website = new Website();

	window.addEventListener('load', () => {
		document.body.classList.add('loaded');

		setTimeout(() => {
			const heroElements = document.querySelectorAll('.hero-text, .hero-visual');
			heroElements.forEach((element, index) => {
				setTimeout(() => {
					element.classList.add('animate-in');
				}, index * 200);
			});
		}, 300);
	});
});

function addGlowEffect(element, color = '#00ff88') {
	element.style.boxShadow = `0 0 20px ${color}`;
	setTimeout(() => {
		element.style.boxShadow = '';
	}, 1000);
}

function createSparkle(x, y) {
	const sparkle = document.createElement('div');
	sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkle 1s ease-out forwards;
    `;

	document.body.appendChild(sparkle);

	setTimeout(() => {
		sparkle.remove();
	}, 1000);
}

const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);