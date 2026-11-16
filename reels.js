(function() {
  const REELS_KEY = "cms_reels_v1";
  let catAtual = "todos";
  let listaReelsAtual = [];
  let idxReelAtual = 0;

  function getMeusReels() {
    return JSON.parse(localStorage.getItem(REELS_KEY) || "[]");
  }

  function salvarMeusReels(lista) {
    localStorage.setItem(REELS_KEY, JSON.stringify(lista));
  }

  let totalBancoServidor = 0;

  function fisherYatesShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function embaralharSemRepetir(lista) {
    const vistos = new Set(JSON.parse(localStorage.getItem("cms_reels_vistos_v2") || "[]"));
    const unicos = [];
    const ids = new Set();
    lista.forEach(item => {
      const chave = item.vid || item.id;
      if (chave && !ids.has(chave)) {
        ids.add(chave);
        unicos.push(item);
      }
    });
    return fisherYatesShuffle(unicos.filter(x => !vistos.has(x.vid || x.id)));
  }

  function getEmailContaReels() {
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : null;
    return (eu && eu.e) ? eu.e.trim().toLowerCase() : "visitante@msaocubo.com";
  }

  window.marcarReelVisto = function(item) {
    if (!item) return;
    const chave = item.vid || item.id;
    if (!chave) return;
    let vistos = JSON.parse(localStorage.getItem("cms_reels_vistos_v2") || "[]");
    if (!vistos.includes(chave)) {
      vistos.unshift(chave);
      localStorage.setItem("cms_reels_vistos_v2", JSON.stringify(vistos.slice(0, 100000)));
    }
    if (item.vid) {
      fetch("/api/reels/visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: getEmailContaReels(), vid: item.vid })
      }).catch(() => {});
    }
  };

  window.abrirReelsCubo = async function(cat = null) {
    if (cat) catAtual = cat;
    document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("btn-tab-reels")?.classList.add("active");
    const perf = document.getElementById("view-perfil");
    if (perf) perf.style.display = "none";

    const sec = document.getElementById("view-reels");
    if (!sec) return;
    sec.style.display = "block";
    sec.innerHTML = `<div style="text-align:center;padding:60px;color:#65676b;font-weight:700;">🚀 Carregando apenas Reels inéditos de Rubik's Cube para sua conta...</div>`;

    try {
      const email = encodeURIComponent(getEmailContaReels());
      const res = await (await fetch("/api/reels?cat=" + encodeURIComponent(catAtual) + "&user=" + email)).json();
      totalBancoServidor = res.totalBanco || (res.results || []).length;
      const vistosLocal = new Set(JSON.parse(localStorage.getItem("cms_reels_vistos_v2") || "[]"));
      const proprios = getMeusReels().filter(x => !vistosLocal.has(x.vid || x.id));
      const inéditosYt = (res.results || []).filter(x => !vistosLocal.has(x.vid || x.id));
      listaReelsAtual = [...proprios, ...fisherYatesShuffle(inéditosYt)];
      idxReelAtual = 0;
      window.marcarReelVisto(listaReelsAtual.at(0));
      window.renderPlayerReels();
    } catch (e) {
      listaReelsAtual = [];
      window.renderPlayerReels();
    }
  };

  let comentariosReelAberto = false;

  window.toggleComentariosReel = function() {
    comentariosReelAberto = !comentariosReelAberto;
    window.renderPlayerReels();
  };

  window.enviarComentarioReel = function(e, reelId) {
    e.preventDefault();
    const inp = document.getElementById("inp-com-reel");
    const txt = inp?.value.trim();
    if (!txt) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const map = JSON.parse(localStorage.getItem("cms_reels_coms_v1") || "{}");
    map[reelId] = map[reelId] || [];
    map[reelId].push({ autor: eu.n, texto: txt, hora: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) });
    localStorage.setItem("cms_reels_coms_v1", JSON.stringify(map));
    window.renderPlayerReels();
  };

  window.renderPlayerReels = function() {
    const sec = document.getElementById("view-reels");
    if (!sec) return;
    document.body.style.overflow = "hidden";
    const item = listaReelsAtual[idxReelAtual];
    const cats = [
      { id: "todos", label: "🔥 Para Você" },
      { id: "wca", label: "🏆 WCA Oficial" },
      { id: "recordes", label: "⚡ World Records" },
      { id: "tutoriais", label: "🧩 Tutoriais" },
      { id: "brasil", label: "🇧🇷 Brasil" }
    ];

    const barraCats = `<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;">
      ${cats.map(c => `<button type="button" onclick="window.abrirReelsCubo('${c.id}')" style="padding:6px 12px;border-radius:18px;border:none;font-size:12px;font-weight:700;cursor:pointer;background:${catAtual===c.id?'#1877f2':'#fff'};color:${catAtual===c.id?'#fff':'#050505'};box-shadow:0 1px 3px rgba(0,0,0,0.12);">${c.label}</button>`).join("")}
      <button type="button" onclick="window.abrirModalNovoReel()" style="padding:6px 14px;border-radius:18px;border:none;font-size:12px;font-weight:800;cursor:pointer;background:#e41e3f;color:#fff;">+ Criar Reel</button>
    </div>`;

    if (!item) {
      sec.innerHTML = `${barraCats}<div style="background:#fff;padding:40px;border-radius:12px;text-align:center;color:#65676b;">Nenhum Reel encontrado. Clique em <b>+ Criar Reel</b> para publicar!</div>`;
      return;
    }

    const P = String.fromCharCode(46);
    const emb = item.vid ? ("https://www" + P + "youtube" + P + "com/embed/" + item.vid + "?autoplay=1&loop=1&playlist=" + item.vid + "&rel=0&controls=1") : "";
    const playerHtml = item.origem === "proprio"
      ? `<video src="${item.videoUrl}" autoplay loop playsinline controls controlsList="nofullscreen" disablePictureInPicture style="width:100%;height:100%;object-fit:contain;background:#000;"></video>`
      : `<iframe src="${emb}" style="width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
    const likesMap = JSON.parse(localStorage.getItem("cms_reels_likes_v2") || "{}");
    const listaQuemCurtiu = likesMap[item.id] || [];
    const curtiu = listaQuemCurtiu.includes(eu.e);
    const qtdLikes = listaQuemCurtiu.length;

    const comsMap = JSON.parse(localStorage.getItem("cms_reels_coms_v1") || "{}");
    const comsLista = comsMap[item.id] || [];

    const painelComs = comentariosReelAberto ? `
      <div style="width:310px;height:calc(100vh - 140px);max-height:530px;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,0.18);display:flex;flex-direction:column;overflow:hidden;border:1px solid #dddfe2;">
        <div style="padding:12px 14px;border-bottom:1px solid #e4e6eb;display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:15px;">💬 Comentários (${comsLista.length})</strong>
          <button type="button" onclick="window.toggleComentariosReel()" style="border:none;background:#e4e6eb;width:26px;height:26px;border-radius:50%;font-weight:bold;cursor:pointer;">✕</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;">
          ${comsLista.map(c => `<div style="background:#f0f2f5;padding:8px 12px;border-radius:12px;font-size:13px;"><strong>${c.autor}</strong> <span style="font-size:10px;color:#65676b;">${c.hora||""}</span><div style="margin-top:2px;">${c.texto}</div></div>`).join("") || `<div style="text-align:center;color:#65676b;font-size:13px;margin-top:40px;">Seja o primeiro a comentar neste Reel!</div>`}
        </div>
        <form onsubmit="window.enviarComentarioReel(event, '${item.id}')" style="padding:10px;border-top:1px solid #e4e6eb;display:flex;gap:6px;">
          <input id="inp-com-reel" placeholder="Adicione um comentário..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:8px 12px;font-size:13px;outline:none;">
          <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:18px;padding:0 14px;font-weight:700;font-size:12px;cursor:pointer;">Enviar</button>
        </form>
      </div>
    ` : "";

    sec.innerHTML = `
      ${barraCats}
      <div style="display:flex;justify-content:center;align-items:center;gap:14px;">
        <div style="position:relative;height:calc(100vh - 135px);max-height:560px;aspect-ratio:9/16;background:#000;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.35);">
          ${playerHtml}<div id="reel-scroll-shield" onclick="this.style.display='none'" title="Role para trocar de Reel ou clique para controlar o vídeo" style="position:absolute;inset:0;bottom:52px;z-index:10;cursor:pointer;"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:14px;background:linear-gradient(transparent, rgba(0,0,0,0.88));color:#fff;pointer-events:none;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="background:#1877f2;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:800;">REELS CMS</span>
              <strong style="font-size:12px;">@${(item.autor || "speedcuber").replace(/\s+/g, "")}</strong>
            </div>
            <div style="font-size:12px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${item.titulo}</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:11px;align-items:center;">
          <button type="button" onclick="window.mudarReel(-1)" ${idxReelAtual===0?'disabled':''} title="Anterior" style="width:40px;height:40px;border-radius:50%;border:none;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:16px;cursor:pointer;opacity:${idxReelAtual===0?'0.4':'1'};">▲</button>
          <button type="button" onclick="window.curtirReelAtual('${item.id}')" style="width:44px;height:44px;border-radius:50%;border:none;background:${curtiu?'#fee2e2':'#fff'};color:${curtiu?'#e41e3f':'#050505'};box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:19px;cursor:pointer;">❤️</button>
          <span style="font-size:12px;font-weight:800;color:#050505;margin-top:-8px;">${qtdLikes}</span>
          <button type="button" onclick="window.toggleComentariosReel()" style="width:44px;height:44px;border-radius:50%;border:none;background:${comentariosReelAberto?'#e7f3ff':'#fff'};box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:19px;cursor:pointer;">💬</button>
          <span style="font-size:12px;font-weight:800;color:#050505;margin-top:-8px;">${comsLista.length}</span>
          <button type="button" onclick="if(window.abrirGeradorDivulgacao) window.abrirGeradorDivulgacao({titulo:'🎬 '+${JSON.stringify(item.titulo)}.slice(0,30), subtitulo:'Reels MS AO CUBO', destaque:'Assista agora no MS AO CUBO!'})" style="width:44px;height:44px;border-radius:50%;border:none;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:19px;cursor:pointer;">🚀</button>
          <button type="button" onclick="window.mudarReel(1)" title="Próximo Reel" style="width:40px;height:40px;border-radius:50%;border:none;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:16px;cursor:pointer;">▼</button>
          <span style="font-size:11px;color:#65676b;font-weight:700;">${idxReelAtual + 1}/${listaReelsAtual.length}</div><div style="font-size:10px;color:#1877f2;font-weight:800;text-align:center;">🗄️ ${totalBancoServidor.toLocaleString("pt-BR")}</span>
        </div>
        ${painelComs}
      </div>
    `;
  };

  window.mudarReel = function(delta) {
    const novo = idxReelAtual + delta;
    if (novo < 0) return;

    if (novo >= listaReelsAtual.length) {
      const atualObj = listaReelsAtual[idxReelAtual];
      const base = listaReelsAtual.length ? [...listaReelsAtual] : getMeusReels();
      if (!base.length) return;
      let novoLote = fisherYatesShuffle(base);
      if (novoLote.length > 1 && atualObj && (novoLote.at(0).vid || novoLote.at(0).id) === (atualObj.vid || atualObj.id)) {
        novoLote.push(novoLote.shift());
      }
      listaReelsAtual.push(...novoLote);
      idxReelAtual = novo;
      window.marcarReelVisto(listaReelsAtual[novo]);
      window.renderPlayerReels();

      fetch("/api/reels?cat=" + encodeURIComponent(catAtual) + "&user=" + encodeURIComponent(getEmailContaReels()))
        .then(r => r.json())
        .then(res => {
          if (res.totalBanco) totalBancoServidor = res.totalBanco;
          if (res.results && res.results.length) {
            const ids = new Set(listaReelsAtual.map(x => x.vid || x.id));
            const inéditos = fisherYatesShuffle(res.results.filter(x => !ids.has(x.vid || x.id)));
            if (inéditos.length) listaReelsAtual.push(...inéditos);
          }
        }).catch(() => {});
      return;
    }

    idxReelAtual = novo;
    window.marcarReelVisto(listaReelsAtual[novo]);
    window.renderPlayerReels();
  };

  window.curtirReelAtual = function(id) {
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
    const map = JSON.parse(localStorage.getItem("cms_reels_likes_v2") || "{}");
    const arr = map[id] || [];
    const pos = arr.indexOf(eu.e);
    if (pos === -1) arr.push(eu.e);
    else arr.splice(pos, 1);
    map[id] = arr;
    localStorage.setItem("cms_reels_likes_v2", JSON.stringify(map));
    window.renderPlayerReels();
  };

  window.abrirModalNovoReel = function() {
    document.getElementById("fb-new-reel-modal")?.remove();
    const m = document.createElement("div");
    m.id = "fb-new-reel-modal";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit;";
    m.innerHTML = `
      <form onsubmit="window.publicarNovoReel(event)" style="background:#fff;width:100%;max-width:430px;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 36px rgba(0,0,0,0.35);">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4e6eb;padding-bottom:10px;">
          <h3 style="margin:0;font-size:18px;font-weight:800;">🎬 Publicar Reel na Plataforma</h3>
          <button type="button" onclick="document.getElementById('fb-new-reel-modal').remove()" style="width:30px;height:30px;border-radius:50%;border:none;background:#e4e6eb;font-weight:bold;cursor:pointer;">✕</button>
        </div>
        <label style="background:#e7f3ff;color:#1877f2;padding:11px;border-radius:8px;text-align:center;font-weight:700;font-size:13px;cursor:pointer;">
          📱 Escolher vídeo vertical (PC ou Celular)
          <input id="reel-file-inp" type="file" accept="video/*" style="display:none;" onchange="document.getElementById('reel-file-lbl').textContent='✅ '+this.files.item(0).name">
          <div id="reel-file-lbl" style="font-size:11px;color:#050505;margin-top:3px;"></div>
        </label>
        <input id="reel-url-inp" placeholder="Ou cole o link de um YouTube Short..." style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
        <input id="reel-tit-inp" required placeholder="Legenda do Reel (ex: Sub-10 no 3x3x3!)" style="padding:9px 12px;border:1px solid #ccc;border-radius:8px;font-size:13px;">
        <button type="submit" style="padding:11px;background:#e41e3f;color:#fff;border:none;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">Publicar Reel Agora</button>
      </form>
    `;
    document.body.appendChild(m);
  };

  window.publicarNovoReel = async function(e) {
    e.preventDefault();
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const titulo = document.getElementById("reel-tit-inp").value.trim();
    const url = document.getElementById("reel-url-inp").value.trim();
    const file = document.getElementById("reel-file-inp")?.files?.item(0);
    const btn = e.target.querySelector("button[type=submit]");

    const salvarEExibir = (novoObj) => {
      const lista = getMeusReels();
      lista.unshift(novoObj);
      salvarMeusReels(lista);
      document.getElementById("fb-new-reel-modal")?.remove();
      window.abrirReelsCubo("todos");
    };

    if (file) {
      if (btn) { btn.disabled = true; btn.textContent = "⏳ Enviando vídeo..."; }
      try {
        const res = await fetch("/api/reels/upload", { method: "POST", body: file });
        const data = await res.json();
        if (data.url) {
          return salvarEExibir({ id: "prop_" + Date.now(), origem: "proprio", videoUrl: data.url, titulo, autor: eu.n });
        }
      } catch (err) {
        alert("Erro ao enviar vídeo para o servidor.");
      }
      if (btn) { btn.disabled = false; btn.textContent = "Publicar Reel Agora"; }
    } else if (url) {
      const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (!m) return alert("Cole um link válido de vídeo ou Short do YouTube!");
      salvarEExibir({ id: "prop_" + Date.now(), origem: "youtube", vid: m.at(1), titulo, autor: eu.n });
    } else {
      alert("Selecione um arquivo de vídeo ou cole um link do YouTube Short!");
    }
  };

  window.pausarTodosVideosCMS = function() {
    document.body.style.overflow = "";
    document.querySelectorAll("video").forEach(v => { try { v.pause(); } catch (e) {} });
    document.querySelectorAll(".cms-yt-active-box").forEach(box => {
      const oldId = box.getAttribute("data-vid");
      if (oldId && window.gerarCapaYoutubeHTML) box.outerHTML = window.gerarCapaYoutubeHTML(oldId);
    });
    const vr = document.getElementById("view-reels");
    if (vr && vr.style.display === "none") {
      vr.querySelectorAll("iframe").forEach(ifr => ifr.remove());
    }
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn, .fb-menu-item, .logo-cms, .fb-circle-btn");
    if (btn && btn.id !== "btn-tab-reels") {
      setTimeout(window.pausarTodosVideosCMS, 20);
    }
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.pausarTodosVideosCMS();
  });

  let travaScrollReel = false;
  let touchStartY = 0;

  document.addEventListener("wheel", (e) => {
    const vr = document.getElementById("view-reels");
    if (!vr || vr.style.display !== "block" || travaScrollReel) return;
    if (Math.abs(e.deltaY) < 5) return;
    if (e.target.closest("#inp-com-reel") || e.target.closest("[style*='overflow-y:auto']")) return;
    travaScrollReel = true;
    window.mudarReel(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => { travaScrollReel = false; }, 320);
  }, { passive: true });

  document.addEventListener("touchstart", (e) => {
    touchStartY = e.touches.item(0)?.clientY || 0;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    const vr = document.getElementById("view-reels");
    if (!vr || vr.style.display !== "block" || travaScrollReel) return;
    const endY = e.changedTouches.item(0)?.clientY || 0;
    const diff = touchStartY - endY;
    if (Math.abs(diff) > 50) {
      travaScrollReel = true;
      window.mudarReel(diff > 0 ? 1 : -1);
      setTimeout(() => { travaScrollReel = false; }, 320);
    }
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    const vr = document.getElementById("view-reels");
    if (!vr || vr.style.display !== "block") return;
    if (e.key === "ArrowDown") window.mudarReel(1);
    if (e.key === "ArrowUp") window.mudarReel(-1);
  });

})();
