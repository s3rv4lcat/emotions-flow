// ── ANIMATED GRID ──
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W, H, cols, rows, nodes = [], animFrame;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cols = Math.ceil(W / 80);
  rows = Math.ceil(H / 80);
  nodes = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      nodes.push({
        bx: c * 80, by: r * 80,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
        amp:   3 + Math.random() * 5,
        px: 0, py: 0
      });
    }
  }
}

let t = 0;
function drawGrid() {
  ctx.clearRect(0, 0, W, H);
  t += 0.008;

  nodes.forEach(n => {
    n.px = n.bx + Math.sin(t * n.speed + n.phase) * n.amp;
    n.py = n.by + Math.cos(t * n.speed + n.phase + 1) * n.amp;
  });

  const stride = cols + 1;
  ctx.strokeStyle = 'rgba(150,110,30,0.10)';
  ctx.lineWidth = 0.5;

  nodes.forEach((n, i) => {
    const c = i % stride;
    const r = Math.floor(i / stride);
    if (c < cols) {
      const nb = nodes[i + 1];
      ctx.beginPath();
      ctx.moveTo(n.px, n.py);
      ctx.lineTo(nb.px, nb.py);
      ctx.stroke();
    }
    if (r < rows) {
      const nb = nodes[i + stride];
      ctx.beginPath();
      ctx.moveTo(n.px, n.py);
      ctx.lineTo(nb.px, nb.py);
      ctx.stroke();
    }
  });

  nodes.forEach((n, i) => {
    if (i % 7 === 0) {
      const pulse = (Math.sin(t * 1.5 + n.phase) + 1) / 2;
      ctx.beginPath();
      ctx.arc(n.px, n.py, 1.2 + pulse * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150,110,30,${0.20 + pulse * 0.35})`;
      ctx.fill();
    }
  });

  animFrame = requestAnimationFrame(drawGrid);
}

resize();
window.addEventListener('resize', resize);
drawGrid();

// ── I18N ──
const LANG = document.documentElement.lang === 'en' ? 'en' : 'sr';

const i18n = {
  sr: {
    phases: [
      { label: 'udahni',  duration: 4, scale: 1.38 },
      { label: 'izdahni', duration: 6, scale: 0.88 },
    ],
    breathInit: 'udahni', breathInitCount: '4',
    breathHint: 'klikni za pauzu · ili nastavi',
    breathResume: 'klikni za nastavak',
    testimonials: [
      { q: "Posle jedne sesije se osećam kao da sam spala teret koji nisam znala da nosim.", c: "Klijentkinja, Beograd" },
      { q: "Nevena ima dar da te vidi dublje nego što ti vidiš sebe. Moja anksioznost je konačno dobila pravi odgovor.", c: "Klijent, Novi Sad" },
      { q: "Kroz konstelacije sam razumela zašto se u porodici uvek ponavljao isti obrazac. Neverovatno oslobađajuće.", c: "Klijentkinja, Niš" },
      { q: "Tai Chi prakse su mi promenile jutarnju rutinu — sada krećem dan iz mira, a ne iz haosa.", c: "Klijent, Beograd" },
      { q: "Nisam verovao u regresiju dok nisam iskusio. Razrešio sam nešto što godinama nisam uspevao da prevaziđem.", c: "Klijent, Kragujevac" },
      { q: "Nevena me je naučila da slušam telo, a ne samo um. To je promenilo moje razumevanje sebe.", c: "Klijentkinja, Beograd" },
      { q: "Posle hipnoterapije, strah koji me je pratio od detinjstva jednostavno nije bio tu više.", c: "Klijentkinja, Subotica" },
      { q: "Duboki Peat je radio nešto što ni sam nisam umeo da objasnim — a rezultat je stvaran i trajan.", c: "Klijent, Novi Beograd" },
      { q: "Svaka sesija je bila korak ka verziji sebe u kojoj se konačno prepoznajem. Hvala ti, Nevena.", c: "Klijentkinja, Zrenjanin" },
    ],
    submitLabel: 'Pošalji poruku',
    submittedLabel: 'Poslato ✓',
  },
  en: {
    phases: [
      { label: 'inhale',  duration: 4, scale: 1.38 },
      { label: 'exhale', duration: 6, scale: 0.88 },
    ],
    breathInit: 'inhale', breathInitCount: '4',
    breathHint: 'click to pause · or continue',
    breathResume: 'click to resume',
    testimonials: [
      { q: "After one session I felt as though I had shed a weight I didn't know I was carrying.", c: "Client, Belgrade" },
      { q: "Nevena has a gift for seeing you more deeply than you see yourself. My anxiety finally found its proper answer.", c: "Client, Novi Sad" },
      { q: "Through constellations I understood why the same pattern kept repeating in my family. Incredibly liberating.", c: "Client, Niš" },
      { q: "The Tai Chi practices changed my morning routine — I now start the day from stillness rather than chaos.", c: "Client, Belgrade" },
      { q: "I didn't believe in regression until I experienced it. I resolved something I hadn't been able to overcome for years.", c: "Client, Kragujevac" },
      { q: "Nevena taught me to listen to the body, not just the mind. That changed my understanding of myself.", c: "Client, Belgrade" },
      { q: "After hypnotherapy, the fear that had been with me since childhood simply wasn't there anymore.", c: "Client, Subotica" },
      { q: "Deep Peat did something I couldn't even explain myself — and the result is real and lasting.", c: "Client, Novi Beograd" },
      { q: "Every session was a step toward the version of myself I finally recognise. Thank you, Nevena.", c: "Client, Zrenjanin" },
    ],
    submitLabel: 'Send message',
    submittedLabel: 'Sent ✓',
  }
};

const T = i18n[LANG];

// ── BREATHING ──
const phases  = T.phases;
const bubble  = document.getElementById('bubble');
const labelEl = document.getElementById('breathLabel');
const countEl = document.getElementById('breathCount');
const hintEl  = document.getElementById('breathHint');
let running = false, phaseIdx = 0, timer = null, cdTimer = null;

function applyPhase(idx) {
  const p = phases[idx];
  labelEl.textContent = p.label;
  countEl.textContent = '1';
  bubble.style.transition = `transform ${p.duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
  bubble.style.transform  = `scale(${p.scale})`;
  bubble.style.boxShadow  = idx === 0
    ? '0 0 60px rgba(196,150,58,0.30), 0 0 120px rgba(196,150,58,0.12), inset 0 1px 0 rgba(255,255,255,0.4)'
    : '0 0 30px rgba(196,150,58,0.18), inset 0 1px 0 rgba(255,255,255,0.3)';
}

function startCd(dur) {
  clearInterval(cdTimer);
  let r = 1;
  cdTimer = setInterval(() => { r++; if (r <= dur) countEl.textContent = r; }, 1000);
}

function nextPhase() {
  applyPhase(phaseIdx);
  startCd(phases[phaseIdx].duration);
  timer = setTimeout(() => {
    phaseIdx = (phaseIdx + 1) % phases.length;
    nextPhase();
  }, phases[phaseIdx].duration * 1000);
}

function startBreathing() {
  if (running) {
    running = false;
    clearTimeout(timer); clearInterval(cdTimer);
    bubble.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    bubble.style.transform  = 'scale(1)';
    bubble.style.boxShadow  = '0 0 50px rgba(196,150,58,0.20), 0 0 100px rgba(196,150,58,0.10), inset 0 1px 0 rgba(255,255,255,0.35)';
    labelEl.textContent = T.breathInit; countEl.textContent = T.breathInitCount;
    hintEl.classList.remove('hidden');
    hintEl.textContent = T.breathResume;
    phaseIdx = 0;
  } else {
    running = true; phaseIdx = 0;
    hintEl.textContent = T.breathHint;
    hintEl.classList.remove('hidden');
    nextPhase();
  }
}
bubble.addEventListener('click', startBreathing);
setTimeout(() => { startBreathing(); }, 1200);

// ── HAMBURGER ──
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose= document.getElementById('mobileClose');
function openMenu()  { mobileMenu.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMenu() { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }
hamburger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);


// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});
revealEls.forEach(el => observer.observe(el));

// ── TESTIMONIAL CAROUSEL ──
(function () {
  const slides = T.testimonials;
  const qEl   = document.getElementById('tQuote');
  const cEl   = document.getElementById('tCite');
  const dots  = document.querySelectorAll('.t-dot');
  const strip = document.querySelector('.testimonial-strip');
  const E     = 'cubic-bezier(0.4,0,0.2,1)';
  let cur = 0, ticker = null;

  function show(to, dir) {
    qEl.style.transition = `opacity .5s ${E}, transform .5s ${E}`;
    cEl.style.transition  = `opacity .4s ${E}`;
    qEl.style.opacity  = '0';
    qEl.style.transform = `translateX(${dir > 0 ? 32 : -32}px)`;
    cEl.style.opacity  = '0';

    setTimeout(() => {
      qEl.textContent = '“' + slides[to].q + '”';
      cEl.textContent = slides[to].c;
      dots.forEach((d, i) => d.classList.toggle('active', i === to));

      qEl.style.transition  = 'none';
      qEl.style.transform   = `translateX(${dir > 0 ? -24 : 24}px)`;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        qEl.style.transition = `opacity .65s ${E}, transform .65s ${E}`;
        cEl.style.transition  = `opacity .55s ${E} .1s`;
        qEl.style.opacity  = '1';
        qEl.style.transform = 'translateX(0)';
        cEl.style.opacity  = '1';
        cur = to;
      }));
    }, 480);
  }

  function advance() { show((cur + 1) % slides.length, 1); }
  function start()   { ticker = setInterval(advance, 4800); }
  function stop()    { clearInterval(ticker); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === cur) return;
      stop(); show(i, i > cur ? 1 : -1); start();
    });
  });

  strip.addEventListener('mouseenter', stop);
  strip.addEventListener('mouseleave', start);

  start();
}());

// ── CONTACT FORM ──
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button');
  const successEl = document.getElementById('contactSuccess');
  const sendingLabel = LANG === 'sr' ? 'Šalje se…'              : 'Sending…';
  const errorLabel   = LANG === 'sr' ? 'Greška — pokušaj ponovo' : 'Error — try again';

  btn.disabled    = true;
  btn.textContent = sendingLabel;

  try {
    const res = await fetch('https://formspree.io/f/mjygvnvj', {
      method:  'POST',
      body:    new FormData(form),
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      form.style.display    = 'none';
      successEl.style.display = 'block';
    } else {
      btn.textContent = errorLabel;
      btn.disabled    = false;
    }
  } catch {
    btn.textContent = errorLabel;
    btn.disabled    = false;
  }
}
