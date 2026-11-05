/* MD Bot - extras: configurações vindas do painel, vídeo de abertura (cutscene), notícias, modo manutenção e anti-robô.
 * Tudo aqui é opcional: se a API não responder, o site funciona normalmente com js/config.js. */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var CFG = { discordUrl: '', inviteUrl: '', devBanner: null, video: { enabled: false }, newsEnabled: false, maintenance: { enabled: false } };

  function getJSON(url, ms) {
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 4000);
    return fetch(url, { credentials: 'same-origin', signal: ctl ? ctl.signal : undefined }).then(function (r) { clearTimeout(t); return r.ok ? r.json() : Promise.reject(); });
  }

  // ---------- anti-robô (prova de trabalho) nas inscrições ----------
  var f0 = window.fetch;
  function solve(c) {
    var enc = new TextEncoder(), i = 0;
    return (function step() {
      return crypto.subtle.digest('SHA-256', enc.encode(c.salt + c.ts + i)).then(function (h) {
        var d = new Uint8Array(h); if (d[0] === 0 && d[1] === 0) return i; i++; return step();
      });
    })();
  }
  window.fetch = function (u, o) {
    if (typeof u === 'string' && /\/api\/waitlist$/.test(u) && o && o.method === 'POST' && window.crypto && crypto.subtle) {
      return f0('/api/pow').then(function (r) { return r.json(); }).then(function (c) {
        return solve(c).then(function (n) { var b = JSON.parse(o.body); b.pow = { salt: c.salt, ts: c.ts, sig: c.sig, nonce: n }; return f0.call(window, u, Object.assign({}, o, { body: JSON.stringify(b) })); });
      }).catch(function () { return f0.call(window, u, o); });
    }
    return f0.apply(window, arguments);
  };

  // ---------- configurações do painel ----------
  var cfgP = getJSON('/api/config', 3500).then(function (c) { CFG = Object.assign(CFG, c); apply(); return CFG; }, function () { return CFG; });
  function apply() {
    if (CFG.discordUrl && window.DISCORD !== undefined) { window.DISCORD = CFG.discordUrl; if (window.bindCom) bindCom(); }
    var dv = document.querySelector('.dv');
    if (dv) {
      if (CFG.devBanner && CFG.devBanner.enabled === false) dv.remove();
      else if (CFG.devBanner && CFG.devBanner.text) { for (var i = 0; i < dv.childNodes.length; i++) if (dv.childNodes[i].nodeType === 3) { dv.childNodes[i].nodeValue = CFG.devBanner.text; break; } }
    }
    if (CFG.inviteUrl) invite(CFG.inviteUrl);
    if (CFG.maintenance && CFG.maintenance.enabled) maintenance(CFG.maintenance.message);
    if (CFG.newsEnabled) newsDot();
  }
  function invite(url) {
    [].forEach.call(document.querySelectorAll('.bt.dis'), function (b) {
      if (/Adicionar ao servidor/.test(b.textContent)) { var a = document.createElement('a'); a.className = 'bt'; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Adicionar ao servidor'; b.replaceWith(a); }
    });
    var h = $('hadd'); if (h) h.onclick = function () { window.open(url, '_blank', 'noopener'); };
  }
  function maintenance(msg) {
    if ($('mt')) return;
    var o = document.createElement('div'); o.id = 'mt';
    o.innerHTML = '<img src="img/sleep.webp" alt=""><h1>Voltamos já</h1><p></p>'; o.querySelector('p').textContent = msg || 'Estamos fazendo melhorias.';
    document.body.appendChild(o); document.body.style.overflow = 'hidden';
  }

  // ---------- vídeo de abertura (cutscene) ----------
  function cutscene() {
    return cfgP.then(function (c) {
      return new Promise(function (done) {
        var v = c.video;
        if (!v || !v.enabled || !v.src || (c.maintenance && c.maintenance.enabled) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return done();
        try { if (v.once && localStorage.getItem('mdvid') === '1') return done(); } catch (e) { /* ok */ }
        var o = document.createElement('div'); o.id = 'cs';
        o.innerHTML = '<video id="csv" playsinline autoplay preload="auto" disablepictureinpicture disableremoteplayback></video><button class="cs-skip" id="css" type="button">Pular vídeo</button><button class="cs-snd" id="csn" type="button" hidden>Ativar som</button><div class="cs-bar"><i id="csb"></i></div>';
        document.body.appendChild(o); document.body.style.overflow = 'hidden';
        var vd = $('csv'), end = 0, tm;
        function fin() {
          if (end) return; end = 1; clearTimeout(tm);
          try { localStorage.setItem('mdvid', '1'); } catch (e) { /* ok */ }
          document.removeEventListener('keydown', kd); o.classList.add('off'); document.body.style.overflow = '';
          setTimeout(function () { try { vd.pause(); } catch (e) { } o.remove(); done(); }, 600);
        }
        function kd(e) { if (e.key === 'Escape' || e.key === 'Enter') fin(); }
        document.addEventListener('keydown', kd);
        $('css').onclick = fin; vd.onended = fin; vd.onerror = fin; vd.oncontextmenu = function (e) { e.preventDefault(); };
        vd.onloadedmetadata = function () { var vr = vd.videoWidth / vd.videoHeight, sr = innerWidth / innerHeight; vd.style.objectFit = ((vr < 1) === (sr < 1)) ? 'cover' : 'contain'; };
        vd.ontimeupdate = function () { if (vd.duration) $('csb').style.width = (vd.currentTime / vd.duration * 100) + '%'; };
        vd.src = v.src; vd.muted = false;
        var p = vd.play();
        (p && p.catch ? p.catch(function () { vd.muted = true; $('csn').hidden = false; return vd.play(); }) : Promise.resolve()).catch(fin);
        $('csn').onclick = function () { vd.muted = false; this.hidden = true; };
        tm = setTimeout(function () { if (!end && vd.currentTime === 0) fin(); }, 8000);   // não trava se o vídeo não carregar
      });
    });
  }

  // ---------- notícias (popup) ----------
  function seen() { try { return JSON.parse(localStorage.getItem('mdnews') || '[]'); } catch (e) { return []; } }
  function mark(ids) { try { var s = seen(); ids.forEach(function (i) { if (s.indexOf(i) < 0) s.push(i); }); localStorage.setItem('mdnews', JSON.stringify(s.slice(-60))); } catch (e) { /* ok */ } }
  var TL = { novidade: 'Novidade', aviso: 'Aviso', lancamento: 'Lançamento', evento: 'Evento' };
  function loadNews() { return getJSON('/api/news', 4000).then(function (j) { return j.items || []; }, function () { return []; }); }
  function newsDot() { loadNews().then(function (it) { var n = it.filter(function (x) { return seen().indexOf(x.id) < 0; }).length; [].forEach.call(document.querySelectorAll('.nvn'), function (a) { a.classList.toggle('has', n > 0); }); }); }
  window.openNews = function (auto) {
    return loadNews().then(function (items) {
      if (auto) items = items.filter(function (n) { return seen().indexOf(n.id) < 0; });
      if (!items.length) { if (!auto && window.toast) toast('Sem novidades por enquanto.'); return; }
      var i = 0, o = document.createElement('div'); o.id = 'nw'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Novidades');
      o.innerHTML = '<div class="nwc"><button class="px2" type="button" id="nwx" aria-label="Fechar">×</button><div class="nwh"><img id="nwi" alt=""><div><span class="tag" id="nwt"></span><h3 id="nwh"></h3><small id="nwd"></small></div></div><div id="nwb" class="nwb"></div><a class="bt" id="nwa" target="_blank" rel="noopener noreferrer" hidden></a><div class="nwf"><button class="nwn" id="nwp" type="button" aria-label="Anterior">‹</button><div id="nwo" class="nwo"></div><button class="nwn" id="nwq" type="button" aria-label="Próxima">›</button></div><button class="bt v" id="nwc" type="button">Entendi</button></div>';
      document.body.appendChild(o);
      function close() { mark(items.map(function (n) { return n.id; })); o.classList.add('off'); document.removeEventListener('keydown', kd); setTimeout(function () { o.remove(); newsDot(); }, 350); }
      function kd(e) { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); }
      function go(d) { i = (i + d + items.length) % items.length; draw(); }
      function draw() {
        var n = items[i]; $('nwi').src = 'img/' + n.img + '.webp'; $('nwt').textContent = TL[n.type] || 'Novidade'; $('nwh').textContent = n.title;
        $('nwd').textContent = new Date(n.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        var b = $('nwb'); b.textContent = ''; String(n.text).split(/\n+/).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; b.appendChild(p); });
        var a = $('nwa'); if (n.btnUrl) { a.hidden = false; a.href = n.btnUrl; a.textContent = n.btnLabel; } else a.hidden = true;
        var d = $('nwo'); d.textContent = ''; items.forEach(function (x, k) { var s = document.createElement('i'); if (k === i) s.className = 'on'; d.appendChild(s); });
        o.querySelector('.nwf').style.display = items.length > 1 ? 'flex' : 'none';
      }
      $('nwx').onclick = close; $('nwc').onclick = close; $('nwp').onclick = function () { go(-1); }; $('nwq').onclick = function () { go(1); };
      o.addEventListener('click', function (e) { if (e.target === o) close(); }); document.addEventListener('keydown', kd); draw();
    });
  };
  function navLinks() {
    var top = document.querySelector('.top > div'), b = top && top.querySelector('.b');
    if (top && b) { var a = document.createElement('a'); a.href = '#'; a.className = 'nvn'; a.textContent = 'Novidades'; a.onclick = function (e) { e.preventDefault(); openNews(false); }; top.insertBefore(a, b); }
    var m = document.querySelector('.mnu');
    if (m) { var a2 = document.createElement('a'); a2.href = '#'; a2.className = 'nvn'; a2.textContent = 'Novidades'; a2.onclick = function (e) { e.preventDefault(); openNews(false); }; m.insertBefore(a2, m.lastElementChild); }
  }
  navLinks();

  // ---------- encaixa o vídeo antes da conversa com o mascote ----------
  if (typeof window.intro === 'function') {
    var intro0 = window.intro;
    window.intro = function () {
      cfgP.then(function (c) { if (c.maintenance && c.maintenance.enabled) return; return cutscene().then(function () { intro0(); }); });
    };
  }
})();
