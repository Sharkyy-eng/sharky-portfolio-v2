// ── 1. Scroll fade-up ──────────────────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ── 2. Nav shadow on scroll ────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 10);
});

// ── 3. Project filter (projects.html only) ─────────────────
document.querySelectorAll('.filter-btn')?.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category.includes(cat)) ? '' : 'none';
    });
  });
});

// ── 4. Stats counter (eased, scroll-triggered) ────────────
function animateCounter(el, target) {
  const duration = 1400;
  const start = performance.now();
  const suffix = el.dataset.suffix || '';
  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-number[data-target]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.target));
    });
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });
const statsBar = document.querySelector('.hero-stats');
if (statsBar) statsObserver.observe(statsBar);

// ── 5. Canvas particle network ────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = window.innerWidth < 600 ? 28 : 55;
  const MAX_DIST = 130;

  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.4 + 0.8
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!document.hidden) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// ── 6. Typewriter effect ──────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Mechatronics & AI Systems Engineer',
    'Robotics Builder',
    'UAV Systems Designer',
    'Computer Vision Developer',
    'Hardware Prototyper'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const TYPING_MS  = 65;
  const DELETE_MS  = 32;
  const PAUSE_MS   = 1800;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_MS);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? DELETE_MS : TYPING_MS);
  }

  tick();
})();

// ── 7. Scroll cue — hide after scrolling past hero ────────
const scrollCue = document.querySelector('.scroll-cue');
if (scrollCue) {
  window.addEventListener('scroll', () => {
    scrollCue.classList.toggle('hidden', window.scrollY > 60);
  }, { passive: true });
}

// ── 8. Carousel (projects.html only) ─────────────────────
(function initCarousel() {
  const track = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  if (!track || !dotsEl) return;

  let cur = 0;
  const cardW = () => track.children[0].offsetWidth + 14;
  const maxIdx = () => Math.max(0, track.children.length - 2);

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === cur ? ' active' : '');
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(i) {
    cur = Math.max(0, Math.min(i, maxIdx()));
    track.style.transform = `translateX(-${cur * cardW()}px)`;
    dotsEl.querySelectorAll('.dot').forEach((d, j) =>
      d.classList.toggle('active', j === cur)
    );
  }

  document.getElementById('prev').onclick = () => goTo(cur - 1);
  document.getElementById('next').onclick = () => goTo(cur + 1);

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(cur + (dx > 0 ? 1 : -1));
  }, { passive: true });

  buildDots();
})();

// ── 9. Project grid stagger (projects.html only) ──────────
(function initCardObserver() {
  if (!document.getElementById('grid-section')) return;
  const projCards = document.querySelectorAll('.proj-card');
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = Array.from(projCards).indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), i * 75);
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  projCards.forEach(card => cardObserver.observe(card));
})();

// ── 10. Staggered entrance animations ────────────────────
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    Array.from(entry.target.children).forEach((child, i) => {
      setTimeout(() => child.classList.add('visible'), i * 65);
    });
    staggerObserver.unobserve(entry.target);
  });
}, { threshold: 0.05 });

document.querySelectorAll('[data-stagger]').forEach(el => staggerObserver.observe(el));
