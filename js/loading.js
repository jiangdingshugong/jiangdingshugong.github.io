class Loader {
	constructor() {
		this.loadingScreen = document.getElementById('loadingScreen');
		this.progressBar = document.getElementById('progressBar');
		this.progress = 0;
		this.loadingSteps = [
			'Loading fonts...',
			'Initializing particle systems...',
			'Preparing animations...',
			'Optimizing graphics...',
			'Setting up interactions...',
			'Finalizing experience...'
		];
		this.currentStep = 0;
		this.init();
	}

	init() {
		this.simulateLoading();
		this.preloadAssets();
	}

	simulateLoading() {
		const loadingInterval = setInterval(() => {
			this.progress += Math.random() * 15;

			if (this.progress >= 100) {
				this.progress = 100;
				clearInterval(loadingInterval);
				setTimeout(() => this.completeLoading(), 500);
			}

			this.updateProgress();
		}, 200);
	}

	updateProgress() {
		if (this.progressBar) {
			this.progressBar.style.width = this.progress + '%';
		}

		const stepIndex = Math.floor((this.progress / 100) * this.loadingSteps.length);
		if (stepIndex !== this.currentStep && stepIndex < this.loadingSteps.length) {
			this.currentStep = stepIndex;
			this.updateLoadingText(this.loadingSteps[stepIndex]);
		}
	}

	updateLoadingText(text) {
		const loadingTexts = document.querySelectorAll('.loading-subtitle');
		loadingTexts.forEach((element, index) => {
			if (index === this.currentStep) {
				element.style.opacity = '1';
				element.style.transform = 'translateY(0)';
			} else {
				element.style.opacity = '0';
				element.style.transform = 'translateY(10px)';
			}
		});
	}

	preloadAssets() {
		const images = [
			'images/hero-tech.jpg',
			'images/case-1.jpg',
			'images/case-2.jpg',
			'images/case-3.jpg'
		];

		let loadedImages = 0;

		images.forEach(src => {
			const img = new Image();
			img.onload = () => {
				loadedImages++;
				if (loadedImages === images.length) {
					this.assetsLoaded = true;
				}
			};
			img.onerror = () => {
				loadedImages++;
				if (loadedImages === images.length) {
					this.assetsLoaded = true;
				}
			};
			img.src = src;
		});
	}

	completeLoading() {

		this.loadingScreen.style.animation = 'loading-exit 1s ease-out forwards';

		const style = document.createElement('style');
		style.textContent = `
            @keyframes loading-exit {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.5;
                    transform: scale(1.05);
                }
                100% {
                    opacity: 0;
                    transform: scale(1.1);
                    visibility: hidden;
                }
            }
        `;
		document.head.appendChild(style);

		setTimeout(() => {
			document.body.classList.add('loaded');
			this.loadingScreen.style.display = 'none';
			this.triggerEntranceAnimations();
		}, 1000);
	}

	triggerEntranceAnimations() {

		const elements = document.querySelectorAll('.reveal-on-load, .page-entrance');
		elements.forEach((element, index) => {
			setTimeout(() => {
				element.classList.add('animate-in');
			}, index * 100);
		});

		this.createWelcomeSparkles();
		this.enableEffects();
	}

	createWelcomeSparkles() {
		for (let i = 0; i < 20; i++) {
			setTimeout(() => {
				const sparkle = document.createElement('div');
				sparkle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    width: 6px;
                    height: 6px;
                    background: radial-gradient(circle, #00ff88, #00d4ff);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: welcome-sparkle 2s ease-out forwards;
                `;

				document.body.appendChild(sparkle);

				setTimeout(() => sparkle.remove(), 2000);
			}, i * 100);
		}

		const sparkleStyle = document.createElement('style');
		sparkleStyle.textContent = `
            @keyframes welcome-sparkle {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                    box-shadow: 0 0 20px currentColor;
                }
                50% {
                    transform: scale(1.5) rotate(180deg);
                    opacity: 1;
                    box-shadow: 0 0 40px currentColor;
                }
                100% {
                    transform: scale(0) rotate(360deg);
                    opacity: 0;
                    box-shadow: 0 0 10px currentColor;
                }
            }
        `;
		document.head.appendChild(sparkleStyle);
	}

	enableEffects() {

		document.querySelectorAll('.hero-title, .section-title').forEach(element => {
			element.classList.add('holographic-text');
		});

		document.querySelectorAll('.card, .service-card, .about-section').forEach(element => {
			element.classList.add('glass');
		});

		document.querySelectorAll('.service-card, .case-card').forEach(element => {
			element.classList.add('card-3d');
		});

		document.querySelectorAll('.btn, .nav-link').forEach(element => {
			element.classList.add('magnetic-element');
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const loader = new Loader();

	setTimeout(() => {
		if (!document.body.classList.contains('loaded')) {
			loader.completeLoading();
		}
	}, 5000);
});

const fontPreload = document.createElement('link');
fontPreload.rel = 'preload';
fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
fontPreload.as = 'style';
fontPreload.crossOrigin = 'anonymous';
document.head.appendChild(fontPreload);

window.Loader = Loader;