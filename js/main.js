/* ============================================================
   SG SUPPLIERS — MAIN JAVASCRIPT
   Scroll animations, nav, cursor, counters, interactions
   ============================================================ */

'use strict';

// ── DOM READY ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initRevealAnimations();
  initCursorGlow();
  initCounters();
  initFAQ();
  initProductTabs();
  initParallax();
  initMagneticButtons();
  markActiveNavLink();
});

// ── NAVIGATION ─────────────────────────────────────────────
function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('nav-drawer');
  const drawerLinks = document.querySelectorAll('.nav-drawer-link');

  if (!nav) return;

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 40);

    // Hide nav on fast scroll down, show on scroll up
    if (scrollY > 300) {
      if (scrollY > lastScroll + 5) {
        nav.style.transform = 'translateY(-100%)';
        nav.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
      } else if (scrollY < lastScroll - 5) {
        nav.style.transform = 'translateY(0)';
      }
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile drawer
  if (!hamburger || !drawer) return;
  hamburger.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close drawer on link click
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (drawer.classList.contains('open') &&
        !drawer.contains(e.target) &&
        !hamburger.contains(e.target)) {
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

function markActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-drawer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── SCROLL PROGRESS BAR ────────────────────────────────────
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max  = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
}

// ── REVEAL ANIMATIONS (Intersection Observer) ──────────────
function initRevealAnimations() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  els.forEach(el => observer.observe(el));
}

// ── CURSOR GLOW ─────────────────────────────────────────────
function initCursorGlow() {
  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Check if cursor is over dark section
  document.addEventListener('mousemove', e => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const isDark = el?.closest('.hero, .section-dark, footer');
    glow.style.opacity = isDark ? '1' : '0';
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.06;
    glowY += (mouseY - glowY) * 0.06;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    rafId = requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// ── ANIMATED COUNTERS ───────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1800;
      const start = Date.now();

      function update() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / dur, 1);
        // Ease out expo
        const ease = 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(ease * end) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ── FAQ ACCORDION ───────────────────────────────────────────
function initFAQ() {
  const btns = document.querySelectorAll('.faq-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      const isOpen = body.getAttribute('aria-hidden') === 'false';

      // Close all
      document.querySelectorAll('.faq-body').forEach(b => {
        b.setAttribute('aria-hidden', 'true');
        b.style.maxHeight = '0';
        b.previousElementSibling.setAttribute('aria-expanded', 'false');
        b.previousElementSibling.querySelector('.faq-icon')?.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        body.setAttribute('aria-hidden', 'false');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        icon?.classList.add('open');
      }
    });
  });
}

// ── PRODUCT TABS ─────────────────────────────────────────────
function initProductTabs() {
  const tabs     = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  function activateTab(catId) {
    tabs.forEach(t => {
      const active = t.dataset.cat === catId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    sections.forEach(s => {
      const active = s.id === 'cat-' + catId;
      s.hidden = !active;
      if (active) {
        // Re-trigger reveal animations in tab
        s.querySelectorAll('[data-reveal]').forEach(el => {
          el.classList.remove('revealed');
          setTimeout(() => el.classList.add('revealed'), 50);
        });
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.cat));
  });

  // Hash-based activation
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById('cat-' + hash)) {
    activateTab(hash);
  }
}

// ── PARALLAX ─────────────────────────────────────────────────
function initParallax() {
  // Only on desktop & if reduced motion not requested
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect  = el.parentElement.getBoundingClientRect();
      const offset = (rect.top + scrollY) * speed;
      el.style.transform = `translateY(${scrollY * speed - offset * 0.1}px)`;
    });
  }, { passive: true });
}

// ── MAGNETIC BUTTONS ──────────────────────────────────────────
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      const strength = 0.25;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = `transform 0.5s cubic-bezier(0.34,1.56,0.64,1)`;
      btn.style.transform  = 'translate(0, 0)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

// ── FORM HANDLING ─────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('qform');
  if (!form) return;

  // Char counter
  const msgField  = document.getElementById('f-msg');
  const charCount = document.getElementById('cc');
  if (msgField && charCount) {
    msgField.addEventListener('input', () => { charCount.textContent = msgField.value.length; });
  }

  // File upload
  const uploadZone = document.getElementById('uzone');
  const fileInput  = document.getElementById('finput');
  const fileList   = document.getElementById('flist');
  const errFile    = document.getElementById('efile');
  let selectedFiles = [];

  const ALLOWED = [
    'application/pdf','image/jpeg','image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  function renderChips() {
    if (!fileList) return;
    fileList.innerHTML = '';
    selectedFiles.forEach((f, i) => {
      const name = f.name.length > 28 ? f.name.slice(0, 26) + '…' : f.name;
      const chip = document.createElement('span');
      chip.className = 'file-chip';
      chip.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>${name}<button type="button" aria-label="Remove ${f.name}" data-i="${i}">✕</button>`;
      fileList.appendChild(chip);
    });
    uploadZone?.classList.toggle('done', selectedFiles.length > 0);
  }

  fileList?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-i]');
    if (btn) { selectedFiles.splice(+btn.dataset.i, 1); renderChips(); }
  });

  function addFiles(list) {
    if (errFile) { errFile.classList.remove('on'); errFile.textContent = ''; }
    const errs = [];
    Array.from(list).forEach(f => {
      if (!ALLOWED.includes(f.type)) { errs.push(`"${f.name}" — unsupported type.`); return; }
      if (f.size > 5 * 1024 * 1024) { errs.push(`"${f.name}" — exceeds 5 MB.`); return; }
      if (!selectedFiles.find(s => s.name === f.name && s.size === f.size)) selectedFiles.push(f);
    });
    if (errs.length && errFile) { errFile.textContent = errs.join(' '); errFile.classList.add('on'); }
    renderChips();
  }

  fileInput?.addEventListener('change', () => addFiles(fileInput.files));
  uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag'); });
  uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag'));
  uploadZone?.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('drag'); addFiles(e.dataTransfer.files); });
  uploadZone?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput?.click(); } });

  // Validation rules
  const rules = {
    'f-company': { e: 'e-company', t: v => v.trim().length >= 2,   m: 'Please enter your company or organization name.' },
    'f-person':  { e: 'e-person',  t: v => v.trim().length >= 2,   m: "Please enter the contact person's name." },
    'f-email':   { e: 'e-email',   t: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), m: 'Please enter a valid email address.' },
    'f-phone':   { e: 'e-phone',   t: v => /^[\+]?[\d\s\-]{7,16}$/.test(v.trim()), m: 'Please enter a valid phone number.' },
    'f-msg':     { e: 'e-msg',     t: v => v.trim().length >= 10,  m: 'Please describe your requirements (min. 10 characters).' },
  };

  function vf(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const r = rules[id]; const ok = r.t(el.value);
    const em = document.getElementById(r.e);
    el.classList.toggle('error', !ok);
    el.classList.toggle('valid', ok);
    if (em) { em.textContent = r.m; em.classList.toggle('on', !ok); }
    return ok;
  }
  function validateAll() { return Object.keys(rules).map(vf).every(Boolean); }

  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => vf(id));
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const em = document.getElementById(rules[id].e);
      if (em) em.classList.remove('on');
    });
  });

  const sbtn = document.getElementById('sbtn');
  const aok  = document.getElementById('aok');
  const aerr = document.getElementById('aerr');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    aok?.classList.remove('on'); aerr?.classList.remove('on');

    if (!validateAll()) {
      const first = form.querySelector('.form-input.error');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      aerr?.classList.add('on');
      return;
    }

    if (sbtn) { sbtn.classList.add('loading'); sbtn.disabled = true; }

    try {
      const fd = new FormData(form);
      selectedFiles.forEach((f, i) => fd.append('attachment_' + i, f, f.name));
      const res = await fetch(form.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset(); selectedFiles = []; renderChips();
        if (charCount) charCount.textContent = '0';
        form.querySelectorAll('.form-input').forEach(el => el.classList.remove('ok', 'error'));
        aok?.classList.add('on');
        aok?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else throw new Error();
    } catch (_) {
      aerr?.classList.add('on');
      aerr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      if (sbtn) { sbtn.classList.remove('loading'); sbtn.disabled = false; }
    }
  });
}

// Auto-init form if on contact page
if (document.getElementById('qform')) { initForm(); }
