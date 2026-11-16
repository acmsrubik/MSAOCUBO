(function() {
  const MKT_KEY = "cms_marketplace_v1";

  function getAnunciosMKT() {
    const raw = localStorage.getItem(MKT_KEY);
    if (!raw) {
      localStorage.setItem(MKT_KEY, "[]");
      return [];
    }
    const lista = JSON.parse(raw);
    const reais = lista.filter(x => x.autorEmail !== "oficial@cubomagicoms.com.br");
    if (reais.length !== lista.length) {
      localStorage.setItem(MKT_KEY, JSON.stringify(reais));
    }
    return reais;
  }

  function salvarAnunciosMKT(lista) {
    localStorage.setItem(MKT_KEY, JSON.stringify(lista));
  }

  let filtroCat = "Todos";
  let filtroBusca = "";

  window.abrirMarketplaceCubos = function() {
    document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    const perf = document.getElementById("view-perfil");
    if (perf) perf.style.display = "none";

    let sec = document.getElementById("view-marketplace");
    if (!sec) {
      sec = document.createElement("div");
      sec.id = "view-marketplace";
      sec.className = "tab-view";
      const feedEl = document.getElementById("tab-feed");
      const main = feedEl ? feedEl.parentElement : (document.querySelector("main") || document.body);
      main.appendChild(sec);
    }
    sec.style.display = "block";
    setTimeout(() => { sec.style.display = "block"; }, 30);
    window.renderMarketplaceCubos();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.filtrarMKT = function(cat, busca) {
    if (cat !== null) filtroCat = cat;
    if (busca !== null) filtroBusca = busca.toLowerCase();
    window.renderMarketplaceCubos();
  };

  window.renderMarketplaceCubos = function() {
    const sec = document.getElementById("view-marketplace");
    if (!sec) return;
    const todos = getAnunciosMKT();
    const filtrados = todos.filter(item => {
      const okCat = filtroCat === "Todos" || item.categoria === filtroCat;
      const okTxt = !filtroBusca || item.titulo.toLowerCase().includes(filtroBusca) || item.cidade.toLowerCase().includes(filtroBusca) || (item.desc || "").toLowerCase().includes(filtroBusca);
      return okCat && okTxt;
    });

    const cats = ["Todos", "3x3x3 Magnéticos", "2x2 a 7x7", "Pyraminx / Megaminx / Skewb", "Timers & Mats", "Lubrificantes & Acessórios"];
    const cardsHtml = filtrados.map(item => `
      <div onclick="window.verDetalheCuboMKT(${item.id})" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.12);cursor:pointer;transition:transform 0.15s;display:flex;flex-direction:column;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="width:100%;aspect-ratio:1/1;background:#f0f2f5;overflow:hidden;position:relative;">
          <img src="${(item.imgs && item.imgs.at(0)) || item.img}" style="width:100%;height:100%;object-fit:cover;">${(item.imgs && item.imgs.length > 1) ? `<span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.75);color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;">📷 ${item.imgs.length}</span>` : ""}
          <span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.7);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;">${item.condicao}</span>
        </div>
        <div style="padding:12px;flex:1;display:flex;flex-direction:column;">
          <div style="font-size:17px;font-weight:800;color:#050505;">R$ ${item.preco}</div>
          <div style="font-size:14px;font-weight:600;color:#050505;margin-top:2px;line-height:1.3;">${item.titulo}</div>
          <div style="font-size:12px;color:#65676b;margin-top:auto;padding-top:6px;">📍 ${item.cidade}</div>
        </div>
      </div>
    `).join("") || `<div style="grid-column:1/-1;background:#fff;padding:40px;border-radius:10px;text-align:center;color:#65676b;">Nenhum cubo anunciado ainda. Clique em <b>+ Criar novo classificado</b> para publicar o primeiro!</div>`;

    sec.innerHTML = `
      <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start;">
        <aside style="background:#fff;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);position:sticky;top:72px;">
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#050505;">🛍️ Marketplace</h2>
          <input value="${filtroBusca}" oninput="window.filtrarMKT(null, this.value)" placeholder="🔍 Pesquisar cubos, marcas..." style="width:100%;box-sizing:border-box;background:#f0f2f5;border:none;border-radius:20px;padding:9px 14px;font-size:13px;outline:none;margin-bottom:12px;">
          <button type="button" onclick="window.abrirModalNovoCuboMKT()" style="width:100%;background:#e7f3ff;color:#1877f2;border:none;border-radius:8px;padding:10px;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:14px;">+ Criar novo classificado</button>
          <div style="font-size:13px;font-weight:700;color:#65676b;margin-bottom:6px;">Categorias</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${cats.map(c => `<button type="button" onclick="window.filtrarMKT('${c}', null)" style="text-align:left;padding:8px 10px;border:none;border-radius:8px;font-size:13px;font-weight:${filtroCat===c?'700':'600'};background:${filtroCat===c?'#e7f3ff':'transparent'};color:${filtroCat===c?'#1877f2':'#050505'};cursor:pointer;">${c}</button>`).join("")}
          </div>
        </aside>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <h3 style="margin:0;font-size:18px;font-weight:800;color:#050505;">Destaques de hoje em Mato Grosso do Sul</h3>
            <span style="font-size:13px;color:#65676b;font-weight:600;">${filtrados.length} anúncios</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(215px, 1fr));gap:14px;">${cardsHtml}</div>
        </div>
      </div>
    `;
  };

  window.verDetalheCuboMKT = function(id, fotoIdx = 0) {
    document.getElementById("fb-mkt-detail")?.remove();
    const item = getAnunciosMKT().find(x => x.id === id);
    if (!item) return;
    const fotos = (item.imgs && item.imgs.length) ? item.imgs : (item.img ? [item.img] : []);
    const idxAtual = Math.max(0, Math.min(fotos.length - 1, fotoIdx));
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
    const souDono = item.autorEmail === eu.e;

    const thumbsHtml = fotos.length > 1 ? `<div style="display:flex;gap:6px;padding:8px;background:#000;overflow-x:auto;justify-content:center;">
      ${fotos.map((src, i) => `<img onclick="window.verDetalheCuboMKT(${id}, ${i})" src="${src}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ${i === idxAtual ? '#1877f2' : 'transparent'};opacity:${i === idxAtual ? '1' : '0.6'};">`).join("")}
    </div>` : "";

    const m = document.createElement("div");
    m.id = "fb-mkt-detail";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit;";
    m.innerHTML = `
      <div style="background:#fff;width:100%;max-width:820px;border-radius:14px;overflow:hidden;display:grid;grid-template-columns:1.15fr 1fr;max-height:92vh;box-shadow:0 12px 36px rgba(0,0,0,0.35);">
        <div style="background:#111;display:flex;flex-direction:column;justify-content:space-between;position:relative;min-height:380px;">
          <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
            ${fotos.length > 1 ? `<button type="button" onclick="window.verDetalheCuboMKT(${id}, ${(idxAtual - 1 + fotos.length) % fotos.length})" style="position:absolute;left:10px;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,0.85);font-weight:bold;font-size:18px;cursor:pointer;">‹</button>` : ""}
            <img src="${fotos[idxAtual] || ''}" style="width:100%;height:100%;max-height:460px;object-fit:contain;">
            ${fotos.length > 1 ? `<button type="button" onclick="window.verDetalheCuboMKT(${id}, ${(idxAtual + 1) % fotos.length})" style="position:absolute;right:10px;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,0.85);font-weight:bold;font-size:18px;cursor:pointer;">›</button>` : ""}
          </div>
          ${thumbsHtml}
        </div>
        <div style="padding:18px;display:flex;flex-direction:column;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <h3 style="margin:0;font-size:20px;font-weight:800;color:#050505;">${item.titulo}</h3>
            <button onclick="document.getElementById('fb-mkt-detail').remove()" style="width:32px;height:32px;border-radius:50%;border:none;background:#e4e6eb;font-weight:bold;cursor:pointer;flex-shrink:0;">✕</button>
          </div>
          <div style="font-size:22px;font-weight:900;color:#1877f2;margin:6px 0;">R$ ${item.preco}</div>
          <div style="font-size:12px;color:#65676b;margin-bottom:12px;">${item.categoria} • Condição: <strong>${item.condicao}</strong> • 📍 ${item.cidade}</div>
          <div style="font-size:14px;color:#050505;line-height:1.45;background:#f0f2f5;padding:12px;border-radius:10px;margin-bottom:14px;">${item.desc || "Sem descrição adicional."}</div>
          <div style="font-size:13px;color:#65676b;margin-bottom:16px;">Anunciado por: <strong style="color:#050505;">${item.autor}</strong></div>

          <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
            <button type="button" onclick="if(window.abrirGeradorDivulgacao) window.abrirGeradorDivulgacao({titulo: '🛍️ ' + '${item.titulo.replace(/'/g,"\\'")}', subtitulo: 'Marketplace MS AO CUBO • ${item.cidade.replace(/'/g,"\\'")}', destaque: 'Por apenas R$ ${item.preco} (${item.condicao})'})" style="width:100%;padding:9px;background:#e7f3ff;color:#1877f2;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">🚀 Gerar Card de Divulgação deste Cubo</button>
            <button type="button" onclick="window.contatarVendedorMKT(${item.id})" style="width:100%;padding:11px;background:#1877f2;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;">💬 Enviar mensagem ao vendedor</button>
            
            ${souDono ? `<button type="button" onclick="window.excluirAnuncioMKT(${item.id})" style="width:100%;padding:9px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">🗑️ Excluir meu anúncio</button>` : ""}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(m);
  };

  window.excluirAnuncioMKT = function(id) {
    const nova = getAnunciosMKT().filter(x => x.id !== id);
    salvarAnunciosMKT(nova);
    document.getElementById("fb-mkt-detail")?.remove();
    window.renderMarketplaceCubos();
  };

  window.contatarVendedorMKT = function(id) {
    const item = getAnunciosMKT().find(x => x.id === id);
    if (!item) return;
    document.getElementById("fb-mkt-detail")?.remove();
    const textoInicial = `🛍️ Olá! Tenho interesse no anúncio: ${item.titulo} (R$ ${item.preco})`;
    if (typeof window.abrirJanelaChatFB === "function") {
      window.abrirJanelaChatFB(item.autorEmail, item.autor);
      const inp = document.getElementById("fb-chat-input");
      if (inp) { inp.value = textoInicial; inp.focus(); }
      return;
    }
    document.getElementById("fb-mkt-quick-msg")?.remove();
    const q = document.createElement("div");
    q.id = "fb-mkt-quick-msg";
    q.style.cssText = "position:fixed;bottom:0;right:24px;width:328px;background:#fff;border-radius:12px 12px 0 0;box-shadow:0 4px 24px rgba(0,0,0,0.25);border:1px solid #dddfe2;z-index:999999;font-family:inherit;overflow:hidden;";
    q.innerHTML = `
      <div style="padding:10px 14px;background:#1877f2;color:#fff;display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:13px;">💬 Mensagem para ${item.autor}</strong>
        <button type="button" onclick="document.getElementById('fb-mkt-quick-msg').remove()" style="border:none;background:none;color:#fff;font-weight:bold;cursor:pointer;">✕</button>
      </div>
      <form onsubmit="window.enviarQuickMsgMKT(event,'${item.autorEmail}','${(item.autor||'').replace(/'/g,"\'")}')" style="padding:12px;display:flex;flex-direction:column;gap:8px;">
        <textarea id="mkt-qmsg-txt" rows="3" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:8px;font-size:13px;resize:none;">${textoInicial}</textarea>
        <button type="submit" style="padding:9px;background:#1877f2;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Enviar mensagem ➤</button>
      </form>
    `;
    document.body.appendChild(q);
    document.getElementById("mkt-qmsg-txt")?.focus();
  };

  window.enviarQuickMsgMKT = function(e, emailAlvo, nomeAlvo) {
    e.preventDefault();
    const txt = document.getElementById("mkt-qmsg-txt")?.value.trim();
    if (!txt) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const lista = JSON.parse(localStorage.getItem("cms_msgs_v1") || "[]");
    lista.push({ id: Date.now(), de: eu.e, deNome: eu.n, para: emailAlvo, texto: txt, hora: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) });
    localStorage.setItem("cms_msgs_v1", JSON.stringify(lista));
    document.getElementById("fb-mkt-quick-msg").innerHTML = `<div style="padding:18px;text-align:center;color:#1877f2;font-weight:700;font-size:13px;">✓ Mensagem enviada para ${nomeAlvo}!</div>`;
    setTimeout(() => document.getElementById("fb-mkt-quick-msg")?.remove(), 1600);
  };

  let fotosNovoAnuncio = [];

  window.renderPrevFotosNovoMKT = function() {
    const box = document.getElementById("mkt-prev-grid");
    if (!box) return;
    box.innerHTML = fotosNovoAnuncio.map((src, idx) => `
      <div style="position:relative;aspect-ratio:1/1;border-radius:8px;overflow:hidden;border:1px solid #dddfe2;">
        <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
        <button type="button" onclick="fotosNovoAnuncio.splice(${idx},1);window.renderPrevFotosNovoMKT()" title="Excluir foto" style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:#dc2626;color:#fff;font-weight:bold;font-size:11px;cursor:pointer;">✕</button>
      </div>
    `).join("");
  };

  window.addFotosNovoMKT = function(inp) {
    const files = Array.from(inp.files || []);
    if (!files.length) return;
    Promise.all(files.map(f => window.otimizarImagemCDN ? window.otimizarImagemCDN(f, 960, 0.82) : new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(f); }))).then(novas => {
      fotosNovoAnuncio = [...fotosNovoAnuncio, ...novas];
      window.renderPrevFotosNovoMKT();
    });
  };

  window.abrirModalNovoCuboMKT = function() {
    fotosNovoAnuncio = [];
    const m = document.createElement("div");
    m.id = "fb-mkt-new";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit;";
    m.innerHTML = `
      <form onsubmit="window.salvarNovoCuboMKT(event)" style="background:#fff;width:100%;max-width:460px;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px;max-height:92vh;overflow-y:auto;box-shadow:0 12px 36px rgba(0,0,0,0.35);">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4e6eb;padding-bottom:10px;">
          <h3 style="margin:0;font-size:18px;font-weight:800;">Anunciar Cubo ou Acessório</h3>
          <button type="button" onclick="document.getElementById('fb-mkt-new').remove()" style="width:30px;height:30px;border-radius:50%;border:none;background:#e4e6eb;font-weight:bold;cursor:pointer;">✕</button>
        </div>
        <label style="background:#e7f3ff;color:#1877f2;padding:10px;border-radius:8px;text-align:center;font-weight:700;font-size:13px;cursor:pointer;">
          📷 Incluir fotos do produto
          <input type="file" accept="image/*" multiple style="display:none;" onchange="window.addFotosNovoMKT(this)">
        </label>
        <div id="mkt-prev-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;"></div>
        <input id="mkt-tit-inp" required placeholder="Título (ex: GAN 12 MagLev UV)" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <input id="mkt-prc-inp" required placeholder="Preço (ex: 180,00)" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
          <select id="mkt-cnd-inp" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
            <option>Seminovo</option><option>Novo</option><option>Usado</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <select id="mkt-cat-inp" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
            <option>3x3x3 Magnéticos</option><option>2x2 a 7x7</option><option>Pyraminx / Megaminx / Skewb</option><option>Timers & Mats</option><option>Lubrificantes & Acessórios</option>
          </select>
          <input id="mkt-cid-inp" value="Campo Grande, MS" required style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
        </div>
        <textarea id="mkt-dsc-inp" rows="3" placeholder="Detalhes (caixa original, lubrificação, tempo de uso...)" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;resize:none;"></textarea>
        <button type="submit" style="padding:11px;background:#1877f2;color:#fff;border:none;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">Publicar no Marketplace</button>
      </form>
    `;
    document.body.appendChild(m);
  };

  window.salvarNovoCuboMKT = function(e) {
    e.preventDefault();
    if (!fotosNovoAnuncio.length) return alert("Inclua pelo menos 1 foto antes de publicar!");
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const lista = getAnunciosMKT();
    lista.unshift({
      id: Date.now(),
      titulo: document.getElementById("mkt-tit-inp").value.trim(),
      preco: document.getElementById("mkt-prc-inp").value.trim(),
      condicao: document.getElementById("mkt-cnd-inp").value,
      categoria: document.getElementById("mkt-cat-inp").value,
      cidade: document.getElementById("mkt-cid-inp").value.trim(),
      desc: document.getElementById("mkt-dsc-inp").value.trim(),
      autor: eu.n,
      autorEmail: eu.e,
      img: fotosNovoAnuncio.at(0),
      imgs: [...fotosNovoAnuncio],
      criadoEm: Date.now()
    });
    salvarAnunciosMKT(lista); if (window.registrarNotificacaoCMS) window.registrarNotificacaoCMS("Novo cubo publicado no Marketplace: " + document.getElementById("mkt-tit-inp")?.value, "🛍️", "marketplace");
    document.getElementById("fb-mkt-new")?.remove();
    window.renderMarketplaceCubos();
  };
})();
