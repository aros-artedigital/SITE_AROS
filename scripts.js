/* ============================================================
   1. CURSOR CUSTOMIZADO
   ============================================================ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
});

(function animRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
  requestAnimationFrame(animRing);
})();

// Hover state
document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorRing && cursorRing.classList.remove('hover'));
});
document.addEventListener('mousedown', () => cursorRing && cursorRing.classList.add('click'));
document.addEventListener('mouseup',   () => cursorRing && cursorRing.classList.remove('click'));

/* ============================================================
   2. MOBILE NAV
   ============================================================ */
let mobileOpen = false;
function toggleMobileNav() {
  mobileOpen = !mobileOpen;
  document.getElementById('mobile-nav').classList.toggle('open', mobileOpen);
  document.getElementById('hamburger').classList.toggle('active', mobileOpen);
  document.body.style.overflow = mobileOpen ? 'hidden' : '';
}
function closeMobileNav() {
  mobileOpen = false;
  document.getElementById('mobile-nav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   3. NAVBAR SCROLL
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ============================================================
   4. THREE.JS — HERO BACKGROUND
   ============================================================ */
(function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 7);

  // ---- Particle field ----
  const count     = 2200;
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  const c1 = new THREE.Color(0x00e5ff);
  const c2 = new THREE.Color(0x8b3fff);
  const c3 = new THREE.Color(0x0d1a3a);

  for (let i = 0; i < count; i++) {
    const r     = 3.5 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Color mix
    const t   = Math.random();
    const col = t < 0.5 ? c1.clone().lerp(c3, t * 2) : c3.clone().lerp(c2, (t - 0.5) * 2);
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.036,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ---- Torus knot (wireframe) ----
  const tkGeo = new THREE.TorusKnotGeometry(2.0, 0.38, 220, 24, 2, 3);
  const tkMat = new THREE.MeshBasicMaterial({
    color: 0x8b3fff,
    wireframe: true,
    transparent: true,
    opacity: 0.10,
  });
  const torusKnot = new THREE.Mesh(tkGeo, tkMat);
  scene.add(torusKnot);

  // ---- Icosahedron (wireframe) ----
  const iGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const iMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  const ico = new THREE.Mesh(iGeo, iMat);
  scene.add(ico);

  // ---- Octahedron (wireframe) ----
  const oGeo = new THREE.OctahedronGeometry(0.9, 0);
  const oMat = new THREE.MeshBasicMaterial({
    color: 0xff3d8b,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const octa = new THREE.Mesh(oGeo, oMat);
  octa.position.set(2.5, -0.8, -1);
  scene.add(octa);

  // ---- Mouse / touch ----
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 0.7;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    targetX = (t.clientX / window.innerWidth  - 0.5) * 0.7;
    targetY = (t.clientY / window.innerHeight - 0.5) * 0.5;
  }, { passive: true });

  // ---- Render loop ----
  (function render() {
    requestAnimationFrame(render);

    particles.rotation.y  += 0.00055;
    particles.rotation.x  += 0.00025;

    torusKnot.rotation.x  += 0.0035;
    torusKnot.rotation.y  += 0.0025;

    ico.rotation.y        -= 0.005;
    ico.rotation.z        += 0.002;

    octa.rotation.x       += 0.008;
    octa.rotation.y       += 0.005;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (-targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
})();

/* ============================================================
   5. LOADER
   ============================================================ */
(function loader() {
  const bar     = document.getElementById('loader-bar');
  const pct     = document.getElementById('loader-pct');
  const loaderEl = document.getElementById('loader');
  const loaderLogo = document.querySelector('.loader-logo');

  let p = 0;
  gsap.to({}, {
    duration: 2,
    ease: 'power1.inOut',
    onUpdate: function() {
      p = Math.round(this.progress() * 100);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = p + '%';
    },
    onComplete: () => {
      if (loaderLogo) {
        gsap.fromTo(loaderLogo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      }
      setTimeout(() => {
        gsap.to(loaderEl, {
          yPercent: -100,
          duration: 1.0,
          ease: 'power4.inOut',
          onComplete: () => {
            if (loaderEl) loaderEl.style.display = 'none';
            initAnimations();
          }
        });
      }, 400);
    }
  });
})();

/* ============================================================
   6. GSAP SCROLL ANIMATIONS
   ============================================================ */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('expo', '.16,1,.3,1');
  CustomEase.create('soft', '.25,.46,.45,.94');

  /* ---- Hero entrance ---- */
  const heroTl = gsap.timeline({ defaults: { ease: 'expo', duration: 1.1 } });
  heroTl
    .to('.hero-badge',   { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .to('.hero-title',   { opacity: 1, y: 0 }, 0.28)
    .to('.hero-sub',     { opacity: 1, y: 0 }, 0.50)
    .to('.hero-actions', { opacity: 1, y: 0 }, 0.68)
    .to('.hero-scroll',  { opacity: 1, duration: 0.5 }, 1.0);

  // Hero stats count-up
  gsap.utils.toArray('.stat-num').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'expo',
      scrollTrigger: { trigger: '.hero-stats', start: 'top 98%', toggleActions: 'play none none none' }
    });
  });

  /* ---- Generic scroll reveals ---- */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'expo',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1.1, ease: 'expo',
      scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1.1, ease: 'expo',
      scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 1.2, ease: 'expo',
      scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' }
    });
  });

  /* ---- Staggered service cards ---- */
  gsap.fromTo('.service-card',
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, stagger: 0.09, duration: 0.85, ease: 'expo',
      scrollTrigger: { trigger: '.servicos-grid', start: 'top 84%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Portfolio items ---- */
  gsap.fromTo('.port-item',
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1, scale: 1, stagger: 0.09, duration: 0.9, ease: 'expo',
      scrollTrigger: { trigger: '.portfolio-grid', start: 'top 84%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Processo steps ---- */
  gsap.fromTo('.processo-step',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'expo',
      scrollTrigger: { trigger: '.processo-grid', start: 'top 84%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Diferenciais items ---- */
  gsap.fromTo('.diferencial-item',
    { opacity: 0, x: -30 },
    {
      opacity: 1, x: 0, stagger: 0.1, duration: 0.75, ease: 'expo',
      scrollTrigger: { trigger: '.diferenciais-list', start: 'top 80%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Metric cards ---- */
  gsap.fromTo('.dif-metric-card',
    { opacity: 0, x: 30 },
    {
      opacity: 1, x: 0, stagger: 0.08, duration: 0.75, ease: 'expo',
      scrollTrigger: { trigger: '.dif-metrics', start: 'top 80%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Depoimentos ---- */
  gsap.fromTo('.dep-card',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, stagger: 0.12, duration: 0.85, ease: 'expo',
      scrollTrigger: { trigger: '.dep-grid', start: 'top 84%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Pilares ---- */
  gsap.fromTo('.pilar',
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'expo',
      scrollTrigger: { trigger: '.sobre-pilares', start: 'top 84%', toggleActions: 'play none none none' }
    }
  );

  /* ---- Parallax: hero canvas ---- */
  gsap.to('#three-canvas', {
    yPercent: 28,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    }
  });

  /* ---- Parallax: orbs ---- */
  gsap.to('.orb-1', {
    y: 120,
    ease: 'none',
    scrollTrigger: { trigger: '#sobre', start: 'top bottom', end: 'bottom top', scrub: 2 }
  });
  gsap.to('.orb-2', {
    y: -100,
    ease: 'none',
    scrollTrigger: { trigger: '#diferenciais', start: 'top bottom', end: 'bottom top', scrub: 2 }
  });

  
/* ============================================================
   7. FLOATING BUTTONS — Voltar ao topo + WhatsApp
   ============================================================ */
(function initFloatBtns() {

  const btnTop     = document.getElementById('btn-top');
  const THRESHOLD  = 400; // px de scroll para mostrar o botão topo

  if (!btnTop) return;

  /* --- Anel de progresso de scroll --- */
  // Injeta SVG de progresso dentro do botão topo
  const r = 26; // raio do anel
  const circumference = 2 * Math.PI * r;

  const ringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ringSvg.setAttribute('class', 'progress-ring');
  ringSvg.setAttribute('viewBox', '0 0 60 60');

  const trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  trackCircle.setAttribute('class', 'progress-ring__track');
  trackCircle.setAttribute('cx', '30');
  trackCircle.setAttribute('cy', '30');
  trackCircle.setAttribute('r', r);

  const fillCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  fillCircle.setAttribute('class', 'progress-ring__fill');
  fillCircle.setAttribute('cx', '30');
  fillCircle.setAttribute('cy', '30');
  fillCircle.setAttribute('r', r);
  fillCircle.style.strokeDasharray  = circumference;
  fillCircle.style.strokeDashoffset = circumference;

  ringSvg.appendChild(trackCircle);
  ringSvg.appendChild(fillCircle);
  btnTop.style.position = 'relative';
  btnTop.appendChild(ringSvg);

  /* --- Scroll handler --- */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {

      const scrollY   = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = Math.min(scrollY / maxScroll, 1);

      // Visibilidade do botão topo
      if (scrollY > THRESHOLD) {
        btnTop.classList.add('visible');
      } else {
        btnTop.classList.remove('visible');
      }

      // Progresso do anel
      const offset = circumference * (1 - progress);
      fillCircle.style.strokeDashoffset = offset;

      ticking = false;
    });
    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Micro-interação de clique (feedback tátil visual) --- */
  btnTop.addEventListener('click', () => {
    btnTop.style.transform = 'scale(0.9)';
    setTimeout(() => { btnTop.style.transform = ''; }, 180);
  });

})();

  /* ---- Inicia o browser 3D ---- */
  initBrowserModel();

  /* ---- Social Speed Dial ---- */
  (function initSocialDial() {
    const dial   = document.getElementById('social-dial');
    const toggle = document.getElementById('sdial-toggle');
    if (!dial || !toggle) return;
    toggle.addEventListener('click', () => dial.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!dial.contains(e.target)) dial.classList.remove('open');
    });
  })();

} /* fim initAnimations */

/* ============================================================
   8. BROWSER 3D — janela/browser com flutuação + hover hierárquico
   ============================================================ */
function initBrowserModel() {
  const canvas = document.getElementById('browser-canvas');
  const stage  = document.getElementById('dif-browser-stage');
  if (!canvas || !stage || typeof THREE === 'undefined') return;

  const getW = () => stage.offsetWidth;
  const getH = () => stage.offsetHeight;

  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(getW(), getH());

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, getW() / getH(), 0.1, 100);
  camera.position.set(0, 0, 9);

  /* ---- Paleta da marca ---- */
  const C = {
    accent  : 0x00e5ff,
    purple  : 0x7b2fff,
    orange  : 0xff8c42,
    white   : 0xf5f5f7,
    dark    : 0x07070f,
    panel   : 0x0f0f1c,
    bar     : 0x141420,
    red     : 0xff5f57,
    yellow  : 0xfebc2e,
    green   : 0x28c840,
  };

  /* ---- Grupo raiz ---- */
  const root = new THREE.Group();
  scene.add(root);

  /* Escala global — preenche o stage */
  root.scale.setScalar(1.55);

  /* ---- Helpers de geometria ---- */
  function box(w, h, d, color, opacity = 1, wireframe = false) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshBasicMaterial({
      color, wireframe,
      transparent: opacity < 1,
      opacity,
    });
    return new THREE.Mesh(geo, mat);
  }

  function sphere(r, color, opacity = 1) {
    const geo = new THREE.SphereGeometry(r, 14, 14);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
    });
    return new THREE.Mesh(geo, mat);
  }

  function addTo(mesh, x, y, z) {
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  }

  /* ================================================================
     CONSTRUÇÃO DO BROWSER
     ================================================================ */

  /* -- Moldura externa wireframe -- */
  addTo(box(5.2, 3.8, 0.16, C.accent, 0.22, true), 0, 0, 0);

  /* -- Fundo da tela -- */
  addTo(box(4.9, 3.0, 0.10, C.dark, 0.95), 0, -0.22, 0.04);

  /* -- Barra do browser -- */
  addTo(box(4.9, 0.56, 0.12, C.bar, 0.98), 0, 1.50, 0.05);

  /* -- Linha separadora barra/conteúdo -- */
  addTo(box(4.9, 0.013, 0.06, C.accent, 0.30), 0, 1.225, 0.08);

  /* -- Traffic lights -- */
  const tlData = [
    { x: -2.22, col: C.red    },
    { x: -1.93, col: C.yellow },
    { x: -1.64, col: C.green  },
  ];
  tlData.forEach(({ x, col }) => addTo(sphere(0.10, col), x, 1.50, 0.14));

  /* -- URL bar bg -- */
  addTo(box(2.7, 0.30, 0.08, 0x1c1c2e, 0.96), 0.28, 1.50, 0.10);

  /* -- Cadeado (mini box) -- */
  addTo(box(0.14, 0.18, 0.06, C.accent, 0.65), -1.10, 1.50, 0.16);

  /* -- Texto simulado da URL -- */
  addTo(box(1.9, 0.058, 0.04, C.accent, 0.50), 0.40, 1.50, 0.16);

  /* -- Botão de reload (arco — dois boxes cruzados) -- */
  addTo(box(0.22, 0.06, 0.04, C.white, 0.18), 1.55, 1.50, 0.14);
  addTo(box(0.06, 0.22, 0.04, C.white, 0.18), 1.55, 1.50, 0.14);

  /* -- Painel sidebar -- */
  addTo(box(1.05, 3.0, 0.08, C.panel, 0.72), -1.93, -0.22, 0.05);

  /* -- Itens de menu no sidebar -- */
  const menuData = [
    { y:  0.82, w: 0.60, c: C.accent, o: 0.80 },
    { y:  0.44, w: 0.68, c: C.white,  o: 0.20 },
    { y:  0.06, w: 0.52, c: C.white,  o: 0.18 },
    { y: -0.32, w: 0.64, c: C.white,  o: 0.16 },
    { y: -0.70, w: 0.48, c: C.white,  o: 0.14 },
    { y: -1.08, w: 0.58, c: C.white,  o: 0.12 },
    { y: -1.46, w: 0.70, c: C.purple, o: 0.22 },
  ];
  menuData.forEach(({ y, w, c, o }) => {
    addTo(box(w, 0.072, 0.04, c, o), -1.93, y, 0.11);
  });

  /* -- Linhas de código na área de conteúdo -- */
  const codeData = [
    /* y,     xOffset, width, color,    opacity */
    [  0.90,  0.00,    2.20,  C.purple, 0.82 ],
    [  0.62,  0.18,    1.60,  C.accent, 0.60 ],
    [  0.34,  0.38,    1.10,  C.orange, 0.60 ],
    [  0.06,  0.18,    2.80,  C.white,  0.13 ],
    [ -0.22,  0.38,    1.50,  C.accent, 0.50 ],
    [ -0.50,  0.00,    2.40,  C.orange, 0.48 ],
    [ -0.78,  0.18,    1.00,  C.purple, 0.58 ],
    [ -1.06,  0.00,    2.60,  C.white,  0.11 ],
    [ -1.34,  0.38,    1.40,  C.accent, 0.40 ],
    [ -1.62,  0.00,    0.85,  C.purple, 0.52 ],
  ];
  codeData.forEach(([y, xOff, w, c, o]) => {
    /* Ancora pelo canto esquerdo da área de conteúdo (-1.35) */
    const xCenter = -1.35 + xOff + w * 0.5;
    addTo(box(w, 0.078, 0.04, c, o), xCenter, y, 0.11);
  });

  /* -- Cursor piscante -- */
  const cursorMesh = addTo(box(0.065, 0.22, 0.04, C.accent, 0.95), -1.35, 0.90, 0.14);

  /* -- Anel de brilho orbital -- */
  const glowRingGeo = new THREE.TorusGeometry(3.3, 0.018, 8, 90);
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: C.accent, transparent: true, opacity: 0.09,
  });
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  glowRing.rotation.x = 0.28;
  root.add(glowRing);

  /* -- Segundo anel (púrpura, inclinado diferente) -- */
  const glowRing2Geo = new THREE.TorusGeometry(3.6, 0.012, 8, 90);
  const glowRing2Mat = new THREE.MeshBasicMaterial({
    color: C.purple, transparent: true, opacity: 0.07,
  });
  const glowRing2 = new THREE.Mesh(glowRing2Geo, glowRing2Mat);
  glowRing2.rotation.x = -0.5;
  glowRing2.rotation.y =  0.3;
  root.add(glowRing2);

  /* -- Sombra de flutuação (plano elíptico abaixo) -- */
  const shadowGeo = new THREE.PlaneGeometry(4.5, 1.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: C.accent, transparent: true, opacity: 0.07,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(0, -2.4, 0);
  scene.add(shadowPlane);

  /* -- Partículas de fundo -- */
  const pCount = 200;
  const pPos   = new Float32Array(pCount * 3);
  const pCol   = new Float32Array(pCount * 3);
  const cA = new THREE.Color(C.accent);
  const cP = new THREE.Color(C.purple);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 16;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 4;
    const col = Math.random() > 0.55 ? cA : cP;
    pCol[i * 3]     = col.r;
    pCol[i * 3 + 1] = col.g;
    pCol[i * 3 + 2] = col.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.04, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0.40,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));

  /* ================================================================
     ESTADO DE ANIMAÇÃO — hierarquia float / hover
     ================================================================ */
  const state = {
    /* float */
    floatAmp  : 1,          /* 0 = congelado, 1 = flutuação máxima */
    /* hover */
    hoverRotX : 0,
    hoverRotY : 0,
    hoverZ    : 0,          /* avanço suave em Z no hover           */
    glowOpacity: 0,         /* intensifica o glow orbital no hover  */
    /* scroll-driven (GSAP scrub) */
    scrubRotX : 0,
    scrubRotY : 0,
    scrubRotZ : 0,
    scrubPosY : 0,
    scrubPosZ : 0,
  };

  /* ================================================================
     GSAP SCROLL-DRIVEN — rotação + translação via scroll
     ================================================================ */
  gsap.to(state, {
    scrubRotX : Math.PI * 0.65,
    scrubRotY : Math.PI * 1.30,
    scrubRotZ : Math.PI * 0.28,
    scrubPosY : -0.9,
    scrubPosZ :  1.2,
    ease: 'none',
    scrollTrigger: {
      trigger   : '#diferenciais',
      endTrigger: '#depoimentos',
      start     : 'top center',
      end       : 'top center',
      scrub     : 2.2,
    }
  });

  /* ================================================================
     MICRO-INTERAÇÕES — apenas em dispositivos com hover real
     ================================================================ */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    /* Hover ENTER — float para, modelo avança, glow acende */
    stage.addEventListener('mouseenter', () => {
      gsap.to(state, {
        floatAmp    : 0,
        hoverZ      : 0.32,
        glowOpacity : 1,
        duration    : 0.55,
        ease        : 'power2.out',
      });
      gsap.to(root.scale, {
        x: 1.63, y: 1.63, z: 1.63,
        duration: 0.55,
        ease: 'back.out(1.5)',
      });
    });

    /* Hover MOVE — tilt preciso conforme posição do cursor */
    stage.addEventListener('mousemove', e => {
      const rect = stage.getBoundingClientRect();
      /* normaliza -1 a +1 dentro do stage */
      const nx =  (e.clientX - rect.left)  / rect.width  * 2 - 1;
      const ny = -((e.clientY - rect.top)  / rect.height * 2 - 1);

      gsap.to(state, {
        hoverRotX : ny * 0.40,
        hoverRotY : nx * 0.52,
        duration  : 0.30,
        ease      : 'power2.out',
        overwrite : 'auto',
      });
    });

    /* Hover LEAVE — float retoma, modelo recua suavemente */
    stage.addEventListener('mouseleave', () => {
      gsap.to(state, {
        floatAmp    : 1,
        hoverRotX   : 0,
        hoverRotY   : 0,
        hoverZ      : 0,
        glowOpacity : 0,
        duration    : 0.85,
        ease        : 'power3.out',
      });
      gsap.to(root.scale, {
        x: 1.55, y: 1.55, z: 1.55,
        duration: 0.85,
        ease: 'power3.out',
      });
    });
  }

  /* ================================================================
     LOOP DE RENDERIZAÇÃO
     ================================================================ */
  let t = 0;
  (function renderBrowser() {
    requestAnimationFrame(renderBrowser);
    t += 0.007;

    const amp = state.floatAmp;

    /* Flutuação idle — suprimida no hover */
    const floatY   = Math.sin(t * 0.62) * 0.22  * amp;
    const floatRY  = Math.sin(t * 0.44) * 0.055 * amp;
    const floatRZ  = Math.sin(t * 0.31) * 0.018 * amp;

    /* Cursor piscante */
    cursorMesh.material.opacity = 0.5 + Math.sin(t * 4.2) * 0.45;

    /* Rotação suave dos anéis orbitais */
    glowRing.rotation.z  += 0.0025;
    glowRing2.rotation.z -= 0.0018;

    /* Glow intensificado no hover */
    glowRingMat.opacity  = 0.09 + state.glowOpacity * 0.18;
    glowRing2Mat.opacity = 0.07 + state.glowOpacity * 0.12;

    /* Sombra de flutuação — escala e opacidade inversas à altura */
    const shadowScale = 1.0 - floatY * 0.28;
    shadowPlane.scale.set(shadowScale, shadowScale, 1);
    shadowMat.opacity = Math.max(0, 0.07 - floatY * 0.018);
    shadowPlane.position.y = state.scrubPosY - 2.3 + floatY * 0.4;

    /* Composição final das rotações */
    root.rotation.x = state.scrubRotX + floatRZ  + state.hoverRotX;
    root.rotation.y = state.scrubRotY + floatRY  + state.hoverRotY;
    root.rotation.z = state.scrubRotZ + floatRZ;
    root.position.y = state.scrubPosY + floatY;
    root.position.z = state.scrubPosZ + state.hoverZ;

    renderer.render(scene, camera);
  })();

  /* ---- Responsividade ---- */
  window.addEventListener('resize', () => {
    renderer.setSize(getW(), getH());
    camera.aspect = getW() / getH();
    camera.updateProjectionMatrix();
  }, { passive: true });
}

/* ============================================================
   9. ALTERNADOR DE TEMA DARK / LIGHT
   ============================================================ */
(function initThemeToggle() {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');
  if (!btn) return;

  // Aplica tema salvo no localStorage
  const saved = localStorage.getItem('aros-theme');
  if (saved === 'light') html.setAttribute('data-theme', 'light');

  btn.addEventListener('click', () => {
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
      html.removeAttribute('data-theme');
      localStorage.setItem('aros-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('aros-theme', 'light');
    }
  });
})();