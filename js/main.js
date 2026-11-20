// Éden Tabletop — animações e demos do site.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Abertura ----------
  // Some 1,3 s depois da página montar (não espera as fontes da internet).
  const shotMode = location.search.includes("shot");  // ?shot: tudo visível de uma vez (fotos do site)
  if (shotMode) document.documentElement.classList.add("photo-mode");
  setTimeout(() => $("#intro").classList.add("done"), reduce || shotMode ? 0 : 1300);

  // ---------- Navegação ----------
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const burger = $("#burger"), links = $("#links");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    links.classList.toggle("open");
  });
  $$("#links a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open");
    links.classList.remove("open");
  }));
  // Link da seção visível fica aceso.
  const sections = $$("section[id]");
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      $$("#links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  // ---------- Entradas ao rolar ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  // Escalonado dentro de grades.
  $$(".grid, .gallery, .stats, .steps, .faq, .keys").forEach(group => {
    $$(".reveal", group).forEach((el, i) => el.style.setProperty("--d", `${(i % 4) * 0.09}s`));
  });
  $$(".hero .reveal").forEach((el, i) => el.style.setProperty("--d", `${1.2 + i * 0.12}s`));
  $$(".reveal, .reveal-left, .reveal-right").forEach(el => io.observe(el));

  // ---------- Contadores ----------
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      const t0 = performance.now(), dur = 1600;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => counterIO.observe(el));

  // ---------- Palavra que troca no título ----------
  const words = ["três dimensões", "masmorras", "tavernas", "mansões", "noites de tempestade"];
  const rot = $("#rotator");
  let wi = 0;
  // O título fica sempre com a altura da palavra mais alta: trocar a palavra não empurra a página.
  const h1 = rot.closest("h1");
  const fixH1 = () => {
    const cur = rot.textContent;
    h1.style.minHeight = "";
    let tall = 0;
    for (const w of words) { rot.textContent = w; tall = Math.max(tall, h1.offsetHeight); }
    rot.textContent = cur;
    h1.style.minHeight = tall + "px";
  };
  fixH1();
  addEventListener("resize", fixH1);
  if (document.fonts) document.fonts.ready.then(fixH1);
  if (!reduce) setInterval(() => {
    rot.classList.add("out");
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      rot.textContent = words[wi];
      rot.classList.remove("out");
    }, 350);
  }, 2600);

  // ---------- Partículas douradas (poeira de luz) ----------
  const cv = $("#particles"), cx = cv.getContext("2d");
  let W, H, parts = [];
  const resize = () => {
    W = cv.width = cv.offsetWidth * devicePixelRatio;
    H = cv.height = cv.offsetHeight * devicePixelRatio;
    const n = Math.min(90, Math.floor(cv.offsetWidth / 14));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.8 + 0.4) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
      vy: -(Math.random() * 0.35 + 0.08) * devicePixelRatio,
      a: Math.random() * Math.PI * 2,
    }));
  };
  const mouse = { x: -1e9, y: -1e9 };
  cv.parentElement.addEventListener("mousemove", e => {
    const r = cv.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * devicePixelRatio;
    mouse.y = (e.clientY - r.top) * devicePixelRatio;
  });
  const draw = () => {
    cx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.a += 0.02;
      p.x += p.vx + Math.sin(p.a) * 0.12;
      p.y += p.vy;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000 * devicePixelRatio) { p.x += dx * 0.02; p.y += dy * 0.02; }  // foge do mouse
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      const glow = 0.45 + Math.sin(p.a * 1.7) * 0.3;
      cx.beginPath();
      cx.fillStyle = `rgba(240, 197, 116, ${glow})`;
      cx.shadowColor = "rgba(240,197,116,.9)";
      cx.shadowBlur = 8 * devicePixelRatio;
      cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fill();
    }
    requestAnimationFrame(draw);
  };
  resize();
  addEventListener("resize", resize);
  if (!reduce) draw();

  // ---------- Inclinação 3D (hero e cartões) ----------
  const tilt = $("#tilt .frame");
  $("#tilt").addEventListener("mousemove", e => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  $("#tilt").addEventListener("mouseleave", () => (tilt.style.transform = ""));
  $$("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      card.style.transform = `perspective(800px) rotateY(${(x / r.width - 0.5) * 8}deg) rotateX(${-(y / r.height - 0.5) * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });

  // ---------- Botões que trocam uma imagem (Construir, Interface) ----------
  $$("[data-switch]").forEach(group => {
    const img = document.getElementById(group.dataset.switch);
    const cap = group.dataset.caption ? document.getElementById(group.dataset.caption) : null;
    $$(".chip", group).forEach(chip => chip.addEventListener("click", () => {
      if (chip.classList.contains("active")) return;
      $$(".chip", group).forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      img.classList.add("fade");
      if (cap) cap.classList.add("fade");
      setTimeout(() => {
        img.onload = () => img.classList.remove("fade");
        img.src = chip.dataset.img;
        if (cap) { cap.textContent = chip.dataset.cap; cap.classList.remove("fade"); }
      }, 300);
    }));
  });

  // ---------- Tempo: demo do céu (igual à aba Tempo do Éden) ----------
  const sky = $("#sky"), sun = $("#sun"), moon = $("#moon"), stars = $("#stars"), hour = $("#hour"), clock = $("#clock");
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 70 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    stars.appendChild(s);
  }
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = c => `rgb(${c.join(",")})`;
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const updateSky = () => {
    const h = +hour.value;
    const ang = ((h - 6) / 24) * Math.PI * 2;  // 6h nasce, 18h se põe (como no jogo)
    const sy = Math.sin(ang);
    const day = smooth(-0.3, 0.12, sy);
    const dusk = Math.max(0, 1 - Math.abs(sy) / 0.3);
    const zenith = mix([6, 9, 22], [40, 110, 210], day);
    let horizon = mix([16, 20, 40], [150, 195, 240], day);
    horizon = mix(horizon, [245, 140, 70], dusk * 0.8);
    sky.style.background = `linear-gradient(${rgb(zenith)}, ${rgb(horizon)})`;
    const w = sky.clientWidth, hh = sky.clientHeight;
    const px = w / 2 + Math.cos(ang) * (w / 2 - 30) * -1;
    sun.style.transform = `translate(${px - 23}px, ${hh - 40 - sy * (hh - 70)}px)`;
    sun.style.opacity = sy > -0.15 ? 1 : 0;
    const my = -sy;
    moon.style.transform = `translate(${w - px - 18}px, ${hh - 40 - my * (hh - 70)}px)`;
    moon.style.opacity = my > -0.15 ? 1 : 0;
    stars.style.opacity = 1 - day;
    $(".hills").style.filter = `brightness(${0.25 + day * 0.85})`;
    $(".clouds").style.opacity = 0.15 + day * 0.45;
    const hInt = Math.floor(h) % 24, m = Math.round((h - Math.floor(h)) * 60);
    const part = day < 0.15 ? "Noite" : day > 0.85 ? "Dia" : h < 12 ? "Amanhecer" : "Entardecer";
    clock.textContent = `${String(hInt).padStart(2, "0")}:${String(m).padStart(2, "0")} · ${part}`;
  };
  hour.addEventListener("input", updateSky);
  $("#blood").addEventListener("change", e => {
    sky.classList.toggle("blood", e.target.checked);
    if (e.target.checked && +hour.value > 6 && +hour.value < 18) { hour.value = 22; }
    updateSky();
  });
  addEventListener("resize", updateSky);
  updateSky();
  // O relógio anda sozinho até alguém mexer.
  let autoplay = !reduce;
  hour.addEventListener("pointerdown", () => (autoplay = false));
  const tick = () => {
    if (!autoplay) return;
    hour.value = (+hour.value + 0.08) % 24;
    updateSky();
    requestAnimationFrame(tick);
  };
  const skyIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && autoplay) requestAnimationFrame(tick); }), { threshold: 0.4 });
  skyIO.observe($("#sky-demo"));

  // ---------- Galeria: lightbox ----------
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $(".lb-cap", lb);
  const figs = $$(".gallery figure");
  let gi = 0;
  const showFig = i => {
    gi = (i + figs.length) % figs.length;
    lbImg.src = $("img", figs[gi]).src;
    lbCap.textContent = $("figcaption", figs[gi]).textContent;
  };
  figs.forEach((f, i) => f.addEventListener("click", () => { showFig(i); lb.classList.add("open"); }));
  $(".lb-close", lb).addEventListener("click", () => lb.classList.remove("open"));
  $(".lb-prev", lb).addEventListener("click", () => showFig(gi - 1));
  $(".lb-next", lb).addEventListener("click", () => showFig(gi + 1));
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });

  // ---------- Leitor de documento (demo estilo jogo) ----------
  const pages = [
    `<h4>Diário do vigia</h4><p>Terceira noite. A névoa voltou a cobrir a estrada e as lanternas da torre já não alcançam o portão.</p><p>Ouvi passos no pátio, mas não havia ninguém. Deixei a chave sob a pedra do poço, como combinado.</p>`,
    `<h4>Diário do vigia</h4><p>Quarta noite. O sino da capela tocou sozinho três vezes. Contei as badaladas duas vezes para ter certeza.</p><p>Se alguém encontrar este caderno: não abra a porta do porão antes do amanhecer.</p>`,
    `<h4>Diário do vigia</h4><p>A chave não está mais no poço.</p><p>Há marcas de lama subindo a escada da torre. Elas param na frente da minha porta.</p>`,
  ];
  const reader = $("#reader"), rPage = $("#r-page"), rCount = $("#r-count"), rPrev = $("#r-prev"), rNext = $("#r-next");
  let pi = 0;
  const setPage = (i, anim = true) => {
    pi = Math.max(0, Math.min(pages.length - 1, i));
    rPage.innerHTML = pages[pi];
    rCount.textContent = `Página ${pi + 1} de ${pages.length}`;
    rPrev.hidden = pi === 0;
    rNext.hidden = pi === pages.length - 1;
    if (anim) { rPage.classList.remove("turn"); void rPage.offsetWidth; rPage.classList.add("turn"); }
  };
  const openReader = () => { setPage(0, false); rPage.classList.remove("zoom"); reader.classList.add("open"); };
  const closeReader = () => reader.classList.remove("open");
  $("#open-doc").addEventListener("click", openReader);
  $("#r-close").addEventListener("click", closeReader);
  $("#paper-preview").addEventListener("click", openReader);
  rPrev.addEventListener("click", () => setPage(pi - 1));
  rNext.addEventListener("click", () => setPage(pi + 1));
  rPage.addEventListener("click", () => rPage.classList.toggle("zoom"));
  reader.addEventListener("wheel", e => {
    e.preventDefault();
    rPage.classList.toggle("zoom", e.deltaY < 0);
  }, { passive: false });
  reader.addEventListener("click", e => { if (e.target === reader) closeReader(); });

  // ---------- Celular: deslizar o dedo troca a página / a foto ----------
  const swipe = (el, onLeft, onRight) => {
    let x0 = null, y0 = 0;
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onLeft : onRight)();
      x0 = null;
    });
  };
  swipe(reader, () => setPage(pi + 1), () => setPage(pi - 1));
  swipe(lb, () => showFig(gi + 1), () => showFig(gi - 1));

  // ---------- Teclado ----------
  addEventListener("keydown", e => {
    if (reader.classList.contains("open")) {
      if (e.key === "Escape") closeReader();
      if (e.key === "ArrowRight") setPage(pi + 1);
      if (e.key === "ArrowLeft") setPage(pi - 1);
      return;
    }
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowRight") showFig(gi + 1);
      if (e.key === "ArrowLeft") showFig(gi - 1);
    }
  });
})();
