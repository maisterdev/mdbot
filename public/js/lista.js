/* Painel /lista (admin). Todo conteúdo dinâmico é inserido com textContent/value: sem risco de XSS. */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var csrf = '', items = [], news = [], settings = null;
  var POSES = [['wave', 'Oi'], ['cheer', 'Comemorando'], ['lol', 'Rindo'], ['point', 'Apontando'], ['love', 'Apaixonado'], ['angry', 'Brabo'], ['scared', 'Assustado'], ['think', 'Pensando'], ['sleep', 'Dormindo'], ['coin', 'Moedas'], ['ban', 'Martelo'], ['stand', 'De boa']];

  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.add('on'); setTimeout(function () { e.classList.remove('on'); }, 2800); }
  function api(url, opt) {
    opt = opt || {}; opt.credentials = 'same-origin';
    opt.headers = Object.assign({ 'Content-Type': 'application/json' }, csrf ? { 'X-CSRF-Token': csrf } : {}, opt.headers || {});
    if (opt.json) { opt.body = JSON.stringify(opt.json); opt.method = 'POST'; }
    return fetch(url, opt).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; return j; }); });
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function fmt(d) { try { return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return d; } }
  function msg(id, t, ok) { var e = $(id); e.textContent = t; e.className = ok ? 'ok' : ''; }
  function show(auth) { $('login').hidden = auth; $('dash').hidden = !auth; }

  // ---------- abas ----------
  $('tabs').addEventListener('click', function (e) {
    var t = e.target.dataset.t; if (!t) return;
    [].forEach.call($('tabs').children, function (b) { b.classList.toggle('on', b === e.target); });
    [].forEach.call(document.querySelectorAll('.tab'), function (s) { s.hidden = s.id !== 't-' + t; });
    if (t === 'noticias') loadNews(); if (t === 'config') loadSettings(); if (t === 'seguranca') loadLog();
  });

  // ---------- inscritos ----------
  function render() {
    var q = $('q').value.trim().toLowerCase(), tb = $('tb'); tb.textContent = '';
    var list = items.filter(function (x) { return (x.nome + ' ' + x.email + ' ' + x.servidor + ' ' + x.discord).toLowerCase().indexOf(q) > -1; });
    list.forEach(function (x) {
      var tr = el('tr');
      [x.nome, x.email, x.servidor || '-', x.discord || '-', fmt(x.data)].forEach(function (v) { tr.appendChild(el('td', '', v)); });
      var ta = el('td', 'a'), b = el('button', '', 'Remover');
      b.onclick = function () {
        if (!confirm('Remover ' + x.email + ' da lista?')) return;
        api('/api/admin/delete', { json: { email: x.email } }).then(function (r) { if (r.ok) { items = items.filter(function (y) { return y.email !== x.email; }); stats(); render(); toast('Removido.'); } else toast(r.error || 'Erro.'); });
      };
      ta.appendChild(b); tr.appendChild(ta); tb.appendChild(tr);
    });
    $('empty').hidden = list.length > 0;
  }
  function stats() {
    var n = Date.now(), d = 864e5, h = 0, w = 0;
    items.forEach(function (x) { var t = n - new Date(x.data).getTime(); if (t < d) h++; if (t < 7 * d) w++; });
    $('s1').textContent = items.length; $('s2').textContent = h; $('s3').textContent = w;
  }
  $('q').addEventListener('input', render);
  $('cp').onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(items.map(function (x) { return x.email; }).join('\n')).then(function () { toast('E-mails copiados.'); }, function () { toast('Não foi possível copiar.'); }); };

  // ---------- notícias ----------
  POSES.forEach(function (p) { var o = el('option', '', p[1]); o.value = p[0]; $('ni').appendChild(o); });
  function resetNews() { $('nf').reset(); $('nid').value = ''; $('nh').textContent = 'Nova notícia'; $('np').checked = true; msg('nerr', ''); }
  function loadNews() {
    api('/api/admin/news').then(function (r) {
      if (!r.ok) return; news = r.items; var box = $('nl'); box.textContent = '';
      if (!news.length) box.appendChild(el('p', 'mut', 'Nenhuma notícia ainda. Crie a primeira ao lado.'));
      news.forEach(function (n) {
        var row = el('div', 'ni'), img = el('img'); img.src = '/img/' + (n.img || 'wave') + '.webp'; img.alt = '';
        var mid = el('div'); mid.appendChild(el('b', '', n.title)); mid.appendChild(el('small', '', n.type + ' · ' + fmt(n.created) + (n.pinned ? ' · fixada' : '')));
        var st = el('span', 'st' + (n.published ? ' on' : ''), n.published ? 'NO AR' : 'RASCUNHO');
        var be = el('button', '', 'Editar'), bd = el('button', 'd', 'Excluir');
        be.onclick = function () { $('nid').value = n.id; $('nt').value = n.title; $('nx').value = n.text; $('ny').value = n.type; $('ni').value = n.img; $('nb').value = n.btnLabel || ''; $('nu').value = n.btnUrl || ''; $('np').checked = n.published; $('nn').checked = n.pinned; $('nh').textContent = 'Editar notícia'; window.scrollTo({ top: 0, behavior: 'smooth' }); };
        bd.onclick = function () { if (confirm('Excluir "' + n.title + '"?')) api('/api/admin/news/delete', { json: { id: n.id } }).then(function () { toast('Notícia excluída.'); loadNews(); }); };
        [img, mid, st, be, bd].forEach(function (x) { row.appendChild(x); }); box.appendChild(row);
      });
    });
  }
  $('nnew').onclick = resetNews;
  $('nf').addEventListener('submit', function (e) {
    e.preventDefault();
    api('/api/admin/news/save', { json: { id: $('nid').value || undefined, title: $('nt').value, text: $('nx').value, type: $('ny').value, img: $('ni').value, btnLabel: $('nb').value, btnUrl: $('nu').value, published: $('np').checked, pinned: $('nn').checked } }).then(function (r) {
      if (r.ok) { toast('Notícia salva.'); resetNews(); loadNews(); } else msg('nerr', r.error || 'Erro ao salvar.');
    });
  });

  // ---------- configurações ----------
  function fillSettings() {
    var s = settings; $('cd').value = s.discordUrl; $('ci').value = s.inviteUrl || ''; $('cbe').checked = s.devBanner.enabled; $('cbt').value = s.devBanner.text;
    $('cve').checked = s.video.enabled; $('cvo').checked = s.video.once; $('cvs').value = s.video.src; $('cne').checked = s.newsEnabled; $('cme').checked = s.maintenance.enabled; $('cmm').value = s.maintenance.message;
    $('cvv').src = s.video.src || '';
  }
  function loadSettings() { api('/api/admin/settings').then(function (r) { if (r.ok) { settings = r.settings; fillSettings(); $('cvup').hidden = !r.canUpload; $('cvn').hidden = !!r.canUpload; } }); }
  $('cf').addEventListener('submit', function (e) {
    e.preventDefault();
    api('/api/admin/settings/save', { json: { discordUrl: $('cd').value.trim(), inviteUrl: $('ci').value.trim(), devBanner: { enabled: $('cbe').checked, text: $('cbt').value }, video: { enabled: $('cve').checked, once: $('cvo').checked, src: $('cvs').value.trim() }, newsEnabled: $('cne').checked, maintenance: { enabled: $('cme').checked, message: $('cmm').value } } }).then(function (r) {
      if (r.ok) { settings = r.settings; fillSettings(); msg('cerr', 'Configurações salvas. O site já usa os novos valores.', true); toast('Salvo.'); } else msg('cerr', r.error || 'Erro ao salvar.');
    });
  });
  $('cvu').onclick = function () {
    var f = $('cvf').files[0]; if (!f) { msg('cerr', 'Escolha um arquivo MP4 ou WebM.'); return; }
    if (f.type !== 'video/mp4' && f.type !== 'video/webm') { msg('cerr', 'Formato não suportado. Converta para MP4 (H.264) ou WebM.'); return; }
    var x = new XMLHttpRequest(), p = $('cvp'); p.hidden = false; p.value = 0;
    x.open('POST', '/api/admin/upload'); x.setRequestHeader('Content-Type', f.type); x.setRequestHeader('X-CSRF-Token', csrf);
    x.upload.onprogress = function (e) { if (e.lengthComputable) p.value = e.loaded / e.total * 100; };
    x.onload = function () { p.hidden = true; var r = {}; try { r = JSON.parse(x.responseText); } catch (e) { } if (r.ok) { $('cvs').value = r.src; $('cvv').src = r.src; $('cve').checked = true; msg('cerr', 'Vídeo enviado. Clique em "Salvar configurações" para ativar.', true); } else msg('cerr', r.error || 'Falha no envio.'); };
    x.onerror = function () { p.hidden = true; msg('cerr', 'Falha de conexão no envio.'); };
    x.send(f);
  };

  // ---------- segurança ----------
  function loadLog() {
    api('/api/admin/security-log').then(function (r) {
      if (!r.ok) return; var tb = $('lg'); tb.textContent = '';
      r.items.forEach(function (x) { var tr = el('tr'); [fmt(x.t), x.tipo, x.ip, x.det].forEach(function (v) { tr.appendChild(el('td', '', v)); }); tb.appendChild(tr); });
    });
    api('/api/admin/settings').then(function (r) { $('tf').textContent = r.totp ? 'Verificação em duas etapas (2FA): ATIVA.' : 'Verificação em duas etapas (2FA): desativada. Veja o guia para ativar.'; });
  }
  $('pf').addEventListener('submit', function (e) {
    e.preventDefault();
    api('/api/admin/password', { json: { current: $('pc').value, next: $('pn').value } }).then(function (r) {
      if (r.ok) { toast('Senha alterada. Entre novamente.'); setTimeout(function () { location.reload(); }, 900); } else msg('perr', r.error || 'Erro.');
    });
  });
  $('la').onclick = function () { if (confirm('Sair de todos os dispositivos?')) api('/api/admin/logout-all', { json: {} }).then(function () { location.reload(); }); };
  $('out').onclick = function () { api('/api/admin/logout', { json: {} }).then(function () { location.reload(); }); };

  // ---------- login ----------
  function load() {
    return api('/api/admin/list').then(function (r) {
      if (r.status === 401) { show(false); return; }
      if (!r.ok) { show(false); msg('lerr', r.error || 'Erro ao carregar.'); return; }
      csrf = r.csrf; items = r.items || []; show(true); stats(); render();
    });
  }
  api('/api/admin/me').then(function (r) { if (r.need2fa) $('cw').hidden = false; if (r.auth) { csrf = r.csrf; load(); } });
  $('lf').addEventListener('submit', function (e) {
    e.preventDefault(); var btn = $('lbtn'); btn.disabled = true; msg('lerr', '');
    api('/api/admin/login', { json: { user: $('u').value, password: $('p').value, code: $('c').value } }).then(function (r) {
      btn.disabled = false;
      if (r.ok) { $('p').value = ''; $('c').value = ''; csrf = r.csrf; $('limg').src = '/img/cheer.webp'; load(); return; }
      $('limg').src = r.status === 429 ? '/img/angry.webp' : '/img/scared.webp'; msg('lerr', r.error || 'Não foi possível entrar.');
    }).catch(function () { btn.disabled = false; msg('lerr', 'Falha de conexão com o servidor.'); });
  });
})();
