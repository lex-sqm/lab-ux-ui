(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mobile = matchMedia('(max-width:1000px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = n => '$' + n.toFixed(2);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Productos (leídos de las tarjetas) ---------- */
  const products = new Map();
  $$('.card').forEach(c => {
    const name = $('h3', c).textContent.trim();
    if (products.has(name)) return;
    const priceTxt = $('.price', c).textContent.trim();
    products.set(name, {
      name, img: $('img', c).getAttribute('src'),
      cat: $('.cat', c).textContent.replace(/^Nº\d · /, '').trim(),
      price: parseFloat(priceTxt.replace(/[^\d.]/g, '')), from: /DESDE/i.test(priceTxt),
      out: !!$('.badge.out', c)
    });
  });

  /* ---------- Overlays (carrito, búsqueda, vista rápida) ---------- */
  document.body.insertAdjacentHTML('beforeend', `
  <div class="ov" id="ov"></div>
  <aside class="drawer" id="drawer" aria-label="Carrito de compras" aria-hidden="true">
    <header><h3>TU CARRITO</h3><button class="x" data-close aria-label="Cerrar carrito">✕</button></header>
    <div class="dl" id="dl"></div>
    <footer><div class="tot"><span>TOTAL</span><b id="tot">$0.00</b></div>
    <button class="btn pri full" id="checkout">FINALIZAR COMPRA →</button><p class="note" id="cnote"></p></footer>
  </aside>
  <div class="srch" id="srch" aria-hidden="true" role="dialog" aria-label="Buscar">
    <div class="sbox"><div class="srow"><input id="sq" type="search" placeholder="Busca tu Fugg…" autocomplete="off" aria-label="Buscar productos"><button class="x" data-close aria-label="Cerrar búsqueda">✕</button></div><ul id="sres"></ul></div>
  </div>
  <div class="qv" id="qv" aria-hidden="true" role="dialog" aria-label="Vista rápida">
    <div class="qbox"><button class="x" data-close aria-label="Cerrar">✕</button><img id="qi" alt=""><div class="qt"><p class="qc" id="qc"></p><h3 id="qn"></h3><p class="qp" id="qp"></p><button class="btn pri" id="qa">AÑADIR AL CARRITO</button></div></div>
  </div>
  <aside class="toast" id="toast" role="status" aria-live="polite"><span class="tk">+1</span><div><b>PRODUCTO AÑADIDO</b><button id="tdet" type="button">Carrito (0) · ver carrito →</button></div></aside>
  <div class="nm" id="nm" aria-hidden="true" role="dialog" aria-labelledby="nmt"><div class="nbx"><p class="nidx">(08) FUGG CLUB</p><h3 id="nmt">¡Ya eres<br>Fugg Club!</h3><p>Gracias por suscribirte. Pronto llegarán las novedades exclusivas de los Fugglers.</p><button class="btn sec" id="nmx">CERRAR</button></div></div>
  <button class="totop" id="totop" aria-label="Volver arriba">↑</button>`);
  const ov = $('#ov'), drawer = $('#drawer'), srch = $('#srch'), qv = $('#qv');
  const panels = { drawer, srch, qv, nm: $('#nm') };
  let openP = null;
  const open = k => {
    close(); openP = k; panels[k].classList.add('open'); panels[k].setAttribute('aria-hidden', 'false'); ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (k === 'srch') setTimeout(() => $('#sq').focus(), 50);
  };
  const close = () => {
    if (!openP) return; panels[openP].classList.remove('open'); panels[openP].setAttribute('aria-hidden', 'true');
    ov.classList.remove('open'); document.body.style.overflow = ''; openP = null;
  };
  ov.addEventListener('click', close);
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); if (e.target === srch || e.target === qv || e.target === $('#nm')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ---------- Carrito ---------- */
  const cartN = $('#cartN');
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('fug-cart') || 'null') || { 'Festive Fuggs S2': 1, 'Baddies': 1 }; } catch (e) { cart = { 'Festive Fuggs S2': 1, 'Baddies': 1 }; }
  Object.keys(cart).forEach(k => { if (!products.has(k)) delete cart[k]; });
  const renderCart = () => {
    const names = Object.keys(cart);
    const qty = names.reduce((a, n) => a + cart[n], 0);
    cartN.textContent = qty;
    let total = 0;
    $('#dl').innerHTML = names.length ? names.map(n => {
      const p = products.get(n); total += p.price * cart[n];
      return `<div class="li"><img src="${p.img}" alt=""><div><h4>${esc(n)}</h4><p>${p.from ? 'DESDE ' : ''}${money(p.price)}</p>
      <div class="qty"><button data-q="-1" data-n="${esc(n)}" aria-label="Quitar uno">−</button><span>${cart[n]}</span><button data-q="1" data-n="${esc(n)}" aria-label="Añadir uno">+</button></div></div>
      <button class="rm" data-rm="${esc(n)}" aria-label="Eliminar ${esc(n)}">✕</button></div>`;
    }).join('') : '<p class="emp">Tu carrito está vacío. ¡Ve por un Fugg!</p>';
    $('#tot').textContent = money(total);
    $('#nmx').addEventListener('click', close);
  $('#checkout').disabled = !names.length;
    try { localStorage.setItem('fug-cart', JSON.stringify(cart)); } catch (e) { }
  };
  const bump = () => { const c = $('.cart'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); };
  let tt;
  const toast = () => {
    const qty = Object.values(cart).reduce((a, b) => a + b, 0);
    $('#tdet').textContent = `Carrito (${qty}) · ver carrito →`;
    const t = $('#toast'); t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200);
  };
  $('#tdet').addEventListener('click', () => { $('#toast').classList.remove('show'); $('#cnote').textContent = ''; open('drawer'); });
  const add = n => { cart[n] = (cart[n] || 0) + 1; renderCart(); bump(); toast(); };
  $('#dl').addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const n = q.dataset.n; cart[n] += +q.dataset.q; if (cart[n] <= 0) delete cart[n]; renderCart(); }
    if (r) { delete cart[r.dataset.rm]; renderCart(); }
  });
  $('#checkout').addEventListener('click', () => { $('#cnote').textContent = '¡Gracias! Esto es un proyecto académico: no se realizan compras reales.'; });
  $('.cart').addEventListener('click', () => { $('#cnote').textContent = ''; open('drawer'); });
  document.addEventListener('click', e => {
    const b = e.target.closest('.add'); if (!b || b.disabled) return;
    const card = b.closest('.card'); add($('h3', card).textContent.trim());
    const old = b.innerHTML; b.innerHTML = '¡AÑADIDO!'; b.classList.add('ok');
    setTimeout(() => { b.innerHTML = old; b.classList.remove('ok'); }, 1100);
  });
  renderCart();

  /* ---------- Vista rápida ---------- */
  let qvName = null;
  const quick = n => {
    const p = products.get(n); if (!p) return; qvName = n;
    $('#qi').src = p.img; $('#qi').alt = n; $('#qc').textContent = p.cat; $('#qn').textContent = n;
    $('#qp').textContent = (p.from ? 'DESDE ' : '') + money(p.price);
    $('#qa').disabled = p.out; $('#qa').textContent = p.out ? 'AGOTADO' : 'AÑADIR AL CARRITO';
    open('qv');
  };
  $('#qa').addEventListener('click', () => { add(qvName); const b = $('#qa'); b.textContent = '¡AÑADIDO!'; setTimeout(() => { b.textContent = 'AÑADIR AL CARRITO'; }, 1000); });
  document.addEventListener('click', e => {
    const a = e.target.closest('.card .ph'); if (!a) return; e.preventDefault();
    if (a.closest('.car') && dragged) return;
    quick($('h3', a.closest('.card')).textContent.trim());
  });
  // Personajes: ampliar foto
  document.addEventListener('click', e => {
    const f = e.target.closest('.fug'); if (!f) return; e.preventDefault();
    const img = $('img', f); $('#qi').src = img.src; $('#qi').alt = img.alt; $('#qc').textContent = 'FUGG FRIENDS';
    $('#qn').textContent = img.alt.replace(/^Nº\d+ /, ''); $('#qp').textContent = ''; qvName = null;
    $('#qa').textContent = 'VER CATÁLOGO →'; $('#qa').disabled = false; $('#qa').dataset.go = '1'; open('qv');
  });
  $('#qa').addEventListener('click', e => { if (e.currentTarget.dataset.go) { delete e.currentTarget.dataset.go; close(); goShop('all'); } }, true);

  /* ---------- Búsqueda ---------- */
  const sres = $('#sres');
  const doSearch = () => {
    const q = $('#sq').value.trim().toLowerCase();
    const list = [...products.values()].filter(p => !q || (p.name + ' ' + p.cat).toLowerCase().includes(q)).slice(0, 8);
    sres.innerHTML = list.length ? list.map(p => `<li><button data-s="${esc(p.name)}"><img src="${p.img}" alt=""><span>${esc(p.name)}<small>${p.cat}</small></span><b>${p.from ? 'DESDE ' : ''}${money(p.price)}</b></button></li>`).join('') : '<li class="none">No encontramos ese Fugg.</li>';
  };
  $('#sq').addEventListener('input', doSearch);
  sres.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) { const n = b.dataset.s; close(); setTimeout(() => quick(n), 60); } });
  $('.search').addEventListener('click', () => { open('srch'); doSearch(); });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('.search').click(); } });

  /* ---------- Menú móvil (pantalla completa, como en Figma) ---------- */
  const mb = $('.menu-btn'), nav = $('#nav');
  document.body.insertAdjacentHTML('beforeend', `
  <div class="mmenu" id="mmenu" aria-hidden="true" role="dialog" aria-label="Menú">
    <p class="mlogo">FUGGLERS</p><button class="mclose" aria-label="Cerrar menú"><i></i><i></i></button>
    <nav aria-label="Menú móvil">${[['top','HOME'],['about','ABOUT'],['collections','COLLECTIONS'],['shop','SHOP'],['contact','CONTACT']].map((l,i)=>`<a href="#${l[0]}"><b>0${i+1}</b>${l[1]}</a>`).join('')}</nav>
    <p class="mtag">TOO WEIRD TO IGNORE //</p>
  </div>`);
  const mm = $('#mmenu');
  const setMenu = o => {
    mm.classList.toggle('open', o); mm.setAttribute('aria-hidden', !o);
    mb.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : '';
    if (o) $('.mclose').focus(); else if (document.activeElement && mm.contains(document.activeElement)) mb.focus();
  };
  mb.addEventListener('click', () => setMenu(true));
  $('.mclose').addEventListener('click', () => setMenu(false));
  mm.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Carruseles (flechas, arrastre, puntos, autoplay) ---------- */
  const car = $('#car'), prev = $('#prev'), next = $('#next'), dots = $('#dots');
  const cards = $$('.card', car);
  cards.forEach((_, i) => { const d = document.createElement('i'); d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Ir a la tarjeta ' + (i + 1)); dots.appendChild(d); });
  dots.removeAttribute('aria-hidden');
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const maxL = () => car.scrollWidth - car.clientWidth - 4;
  const idx = () => Math.min(cards.length - 1, Math.round(car.scrollLeft / step()));
  const upd = () => {
    prev.disabled = car.scrollLeft <= 4; next.disabled = car.scrollLeft >= maxL();
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === idx()));
  };
  const go = i => car.scrollTo({ left: Math.max(0, Math.min(i, cards.length - 1)) * step(), behavior: 'smooth' });
  prev.addEventListener('click', () => go(idx() - 1));
  next.addEventListener('click', () => go(idx() + 1));
  dots.addEventListener('click', e => { const i = $$('i', dots).indexOf(e.target); if (i > -1) go(i); });
  dots.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } });
  car.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
  car.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); }
  });
  // arrastrar con el mouse
  let dragging = false, dragged = false, sx = 0, sl = 0;
  car.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button) return;
    dragging = true; dragged = false; sx = e.clientX; sl = car.scrollLeft; car.classList.add('drag');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return; const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) dragged = true; car.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => {
    if (!dragging) return; dragging = false; car.classList.remove('drag');
    if (dragged) go(Math.round(car.scrollLeft / step()));
    setTimeout(() => { dragged = false; }, 50);
  });
  car.addEventListener('dragstart', e => e.preventDefault());
  // autoplay: pausa al pasar el mouse, al enfocar o fuera de pantalla
  let paused = false, visible = false;
  car.addEventListener('mouseenter', () => paused = true); car.addEventListener('mouseleave', () => paused = false);
  car.addEventListener('focusin', () => paused = true); car.addEventListener('focusout', () => paused = false);
  car.addEventListener('touchstart', () => paused = true, { passive: true });
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }).observe(car);
  if (!reduce) setInterval(() => {
    if (paused || !visible || openP || dragging) return;
    car.scrollLeft >= maxL() ? car.scrollTo({ left: 0, behavior: 'smooth' }) : go(idx() + 1);
  }, 4500);
  addEventListener('resize', upd); upd();

  /* ---------- Catálogo: filtros ---------- */
  const chips = $$('.chip'), items = $$('#cat .card'), all = $('#all'), shop = $('.shop'), empty = $('#empty');
  const layout = () => {
    const vis = items.filter(it => !it.hidden), n = vis.length;
    items.forEach(it => { it.className = it.className.replace(/\bs\d\b/g, '').trim(); });
    vis.forEach((it, i) => it.classList.add('s' + i));
    let top, h;
    if (mobile.matches) {
      const rows = Math.ceil(n / 2), rowTop = [0, 363, 725, 1085][Math.max(rows, 1) - 1];
      top = n ? 334 + rowTop + 371 : 450; h = top + 52 + 56;
    } else { top = n === 0 ? 560 : n <= 4 ? 1119 : 1833; h = top + 52 + 120; }
    all.style.top = (top / 16) + 'rem'; shop.style.setProperty('--sh', (h / 16) + 'rem');
    empty.hidden = n > 0;
  };
  const setFilter = f => {
    chips.forEach(x => { const on = x.dataset.filter === f; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    items.forEach(it => { it.hidden = !(f === 'all' || it.dataset.cat.split(' ').includes(f)); });
    layout();
    const on = $('.chip.on'); if (on) $('.chips').scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
  };
  chips.forEach(c => c.addEventListener('click', () => setFilter(c.dataset.filter)));
  mobile.addEventListener('change', layout); layout();
  const goShop = f => { setFilter(f); shop.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };

  // Colecciones y enlaces que filtran el catálogo
  const colMap = ['9fuggs', 'keychains', 'bigg', 'licensed', 'gift', 'blocks'];
  $$('.col').forEach((c, i) => c.addEventListener('click', e => { e.preventDefault(); goShop(colMap[i]); }));
  const footMap = { 'Todos los Fuggs': 'all', 'Llaveros': 'keychains', '9 pulgadas': '9fuggs', 'Bigg Fuggs': 'bigg' };
  $$('.fc a').forEach(a => {
    const t = a.textContent.trim();
    if (t in footMap) a.addEventListener('click', e => { e.preventDefault(); goShop(footMap[t]); });
    else if (t === 'Novedades') a.addEventListener('click', e => { e.preventDefault(); $('#arrivals').scrollIntoView({ behavior: 'smooth' }); });
    else if (t === 'Contacto') a.addEventListener('click', e => { e.preventDefault(); $('#contact').scrollIntoView({ behavior: 'smooth' }); });
    else a.addEventListener('click', e => e.preventDefault());
  });
  $$('.x-l').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goShop('all'); }));
  all.addEventListener('click', e => { e.preventDefault(); setFilter('all'); $('.chips').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  /* ---------- Newsletter ---------- */
  const nf = $('#nf'), em = $('#em'), msg = $('#msg');
  nf.addEventListener('submit', e => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
    em.setAttribute('aria-invalid', !ok);
    msg.textContent = ok ? '¡Listo! Ya eres parte del Fugg Club.' : 'Escribe un correo válido, por ejemplo tu@correo.com';
    if (ok) { nf.reset(); msg.textContent = ''; open('nm'); } else em.focus();
  });

  /* ---------- Navegación activa, volver arriba, parallax ---------- */
  const links = $$('.nav a'), ids = ['top', 'about', 'collections', 'shop', 'contact'];
  const secs = ids.map(i => document.getElementById(i));
  const onScroll = () => {
    const y = scrollY + innerHeight * .35; let cur = 0;
    secs.forEach((s, i) => { if (s.offsetTop <= y) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
    $('#totop').classList.toggle('show', scrollY > 900);
  };
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true }); onScroll();
  $('#totop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const px = $('.px');
  if (!reduce) {
    const L = [[0.1, $$('.circ', px)], [0.3, $$('.giant', px)], [0.6, $$('.pp', px)]];
    const base = new Map(); L.forEach(([, els]) => els.forEach(el => base.set(el, getComputedStyle(el).transform === 'none' ? '' : el.dataset.rot || '')));
    const rots = { g1: -1, p1: -3, p2: 4 };
    const run = () => {
      const r = px.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const delta = ((innerHeight - r.top) / (innerHeight + r.height) - .5) * (innerHeight + r.height);
      L.forEach(([sp, els]) => els.forEach(el => {
        const k = ['g1', 'p1', 'p2'].find(c => el.classList.contains(c));
        el.style.transform = `translateY(${(1 - sp) * delta * .22}px)` + (k ? ` rotate(${rots[k]}deg)` : '');
      }));
    };
    addEventListener('scroll', () => requestAnimationFrame(run), { passive: true }); run();
  }
})();
