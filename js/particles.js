class ParticleSystem {
	constructor(containerId = 'particles-js') {
		this.container = document.getElementById(containerId);
		if (!this.container) return;

		this.particles = [];
		this.connections = [];
		this.mouse = {
			x: 0,
			y: 0
		};
		this.canvas = null;
		this.ctx = null;
		this.animationId = null;

		this.config = {
			particleCount: 100,
			particleSize: {
				min: 1,
				max: 3
			},
			particleSpeed: {
				min: 0.5,
				max: 2
			},
			connectionDistance: 120,
			colors: ['#00ff88', '#00d4ff', '#ff6b6b', '#ffd93d'],
			opacity: {
				min: 0.3,
				max: 0.8
			},
			mouseRadius: 150,
			mouseRepulsion: true
		};

		this.init();
	}

	init() {
		this.createCanvas();
		this.createParticles();
		this.bindEvents();
		this.animate();
	}

	createCanvas() {
		this.canvas = document.createElement('canvas');
		this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
		this.container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
	}

	resizeCanvas() {
		const rect = this.container.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}

	createParticles() {
		for (let i = 0; i < this.config.particleCount; i++) {
			this.particles.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				vx: (Math.random() - 0.5) * this.config.particleSpeed.max,
				vy: (Math.random() - 0.5) * this.config.particleSpeed.max,
				size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
				color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
				opacity: Math.random() * (this.config.opacity.max - this.config.opacity.min) + this.config.opacity.min,
				life: Math.random(),
				decay: Math.random() * 0.01 + 0.005
			});
		}
	}

	bindEvents() {
		window.addEventListener('resize', () => this.resizeCanvas());

		document.addEventListener('mousemove', (e) => {
			const rect = this.container.getBoundingClientRect();
			this.mouse.x = e.clientX - rect.left;
			this.mouse.y = e.clientY - rect.top;
		});
	}

	updateParticles() {
		this.particles.forEach((particle, index) => {

			const dx = this.mouse.x - particle.x;
			const dy = this.mouse.y - particle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < this.config.mouseRadius) {
				const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
				const angle = Math.atan2(dy, dx);

				if (this.config.mouseRepulsion) {
					particle.vx -= Math.cos(angle) * force * 0.5;
					particle.vy -= Math.sin(angle) * force * 0.5;
				} else {
					particle.vx += Math.cos(angle) * force * 0.3;
					particle.vy += Math.sin(angle) * force * 0.3;
				}
			}

			particle.x += particle.vx;
			particle.y += particle.vy;

			if (particle.x < 0 || particle.x > this.canvas.width) {
				particle.vx *= -1;
				particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
			}
			if (particle.y < 0 || particle.y > this.canvas.height) {
				particle.vy *= -1;
				particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
			}

			particle.life -= particle.decay;
			if (particle.life <= 0) {
				particle.life = 1;
				particle.x = Math.random() * this.canvas.width;
				particle.y = Math.random() * this.canvas.height;
				particle.vx = (Math.random() - 0.5) * this.config.particleSpeed.max;
				particle.vy = (Math.random() - 0.5) * this.config.particleSpeed.max;
			}

			particle.vx *= 0.99;
			particle.vy *= 0.99;
		});
	}

	drawParticles() {
		this.particles.forEach(particle => {
			this.ctx.save();
			this.ctx.globalAlpha = particle.opacity * particle.life;
			this.ctx.fillStyle = particle.color;
			this.ctx.shadowBlur = 10;
			this.ctx.shadowColor = particle.color;

			this.ctx.beginPath();
			this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.restore();
		});
	}

	drawConnections() {
		for (let i = 0; i < this.particles.length; i++) {
			for (let j = i + 1; j < this.particles.length; j++) {
				const dx = this.particles[i].x - this.particles[j].x;
				const dy = this.particles[i].y - this.particles[j].y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < this.config.connectionDistance) {
					const opacity = (1 - distance / this.config.connectionDistance) * 0.3;

					this.ctx.save();
					this.ctx.globalAlpha = opacity;
					this.ctx.strokeStyle = '#00ff88';
					this.ctx.lineWidth = 1;
					this.ctx.beginPath();
					this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
					this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
					this.ctx.stroke();
					this.ctx.restore();
				}
			}
		}
	}

	animate() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.updateParticles();
		this.drawConnections();
		this.drawParticles();

		this.animationId = requestAnimationFrame(() => this.animate());
	}

	destroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
		if (this.canvas) {
			this.canvas.remove();
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const particleSystem = new ParticleSystem();

	window.addEventListener('beforeunload', () => {
		particleSystem.destroy();
	});
});

window.ParticleSystem = ParticleSystem;