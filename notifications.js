(function() {
  const NOTIF_KEY = "cms_notifs_v1";

  function getNotifs() {
    let lista = JSON.parse(localStorage.getItem(NOTIF_KEY) || "null");
    if (!lista) {
      lista = [
        { id: 1, tipo: "sistema", icone: "🏆", texto: "Bem-vindo ao sistema de notificações em tempo real do MS AO CUBO!", lida: false, criadoEm: Date.now() }
      ];
      localStorage.setItem(NOTIF_KEY, JSON.stringify(lista));
    }
    return lista;
  }

  function salvarNotifs(lista) {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(lista.slice(0, 50)));
    window.atualizarBadgeNotif();
  }

  window.registrarNotificacaoCMS = function(texto, icone = "🔔", acao = "") {
    const lista = getNotifs();
    lista.unshift({
      id: Date.now() + Math.floor(Math.random() * 100),
      icone,
      texto,
      acao,
      lida: false,
      criadoEm: Date.now()
    });
    salvarNotifs(lista);
  };

  window.atualizarBadgeNotif = function() {
    const badge = document.getElementById("notif-badge-count");
    if (!badge) return;
    const naoLidas = getNotifs().filter(n => !n.lida).length;
    if (naoLidas > 0) {
      badge.style.display = "inline-block";
      badge.textContent = naoLidas > 9 ? "9+" : naoLidas;
    } else {
      badge.style.display = "none";
    }
  };

  window.injetarBotaoNotifTopo = function() {
    const nav = document.querySelector(".fb-nav-right");
    if (!nav || document.getElementById("btn-topo-notif")) return;
    const btn = document.createElement("button");
    btn.id = "btn-topo-notif";
    btn.className = "fb-circle-btn";
    btn.title = "Notificações";
    btn.style.position = "relative";
    btn.innerHTML = `🔔<span id="notif-badge-count" style="display:none;position:absolute;top:-2px;right:-2px;background:#e41e3f;color:#fff;font-size:10px;font-weight:800;padding:1px 5px;border-radius:10px;">0</span>`;
    btn.onclick = (e) => { e.stopPropagation(); window.toggleDropdownNotif(); };
    const perfilBtn = document.getElementById("btn-topo-meu-perfil");
    if (perfilBtn) nav.insertBefore(btn, perfilBtn);
    else nav.appendChild(btn);
    window.atualizarBadgeNotif();
  };

  let filtroNotif = "todas";

  window.toggleDropdownNotif = function(forcarAbrir = false) {
    let drop = document.getElementById("fb-notif-dropdown");
    if (drop && !forcarAbrir) { drop.remove(); return; }
    if (!drop) {
      document.getElementById("fb-messenger-dropdown")?.remove();
      drop = document.createElement("div");
      drop.id = "fb-notif-dropdown";
      drop.onclick = (e) => e.stopPropagation();
      drop.style.cssText = "position:fixed;top:58px;right:16px;width:360px;max-height:500px;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.22);border:1px solid #dddfe2;z-index:99999;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;";
      document.body.appendChild(drop);
    }

    const todas = getNotifs();
    const exibidas = filtroNotif === "naolidas" ? todas.filter(n => !n.lida) : todas;

    const itensHtml = exibidas.map(n => {
      const d = new Date(n.criadoEm);
      const hora = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      return `<div onclick="window.abrirItemNotif(${n.id})" style="display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;background:${n.lida ? '#fff' : '#e7f3ff'};border-bottom:1px solid #f0f2f5;" onmouseover="this.style.filter='brightness(0.97)'" onmouseout="this.style.filter='none'">
        <div style="width:42px;height:42px;border-radius:50%;background:#f0f2f5;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${n.icone || "🔔"}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;color:#050505;line-height:1.35;font-weight:${n.lida ? '400' : '600'};">${n.texto}</div>
          <div style="font-size:11px;color:${n.lida ? '#65676b' : '#1877f2'};font-weight:700;margin-top:2px;">Hoje às ${hora}</div>
        </div>
        ${!n.lida ? `<span style="width:10px;height:10px;border-radius:50%;background:#1877f2;flex-shrink:0;"></span>` : ""}
      </div>`;
    }).join("") || `<div style="padding:24px;text-align:center;color:#65676b;font-size:13px;">Nenhuma notificação nesta aba.</div>`;

    drop.innerHTML = `
      <div style="padding:12px 16px;border-bottom:1px solid #e4e6eb;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:20px;font-weight:800;color:#050505;">Notificações</strong>
          <button type="button" onclick="window.marcarTodasNotifsLidas()" style="background:none;border:none;color:#1877f2;font-size:12px;font-weight:700;cursor:pointer;">Marcar tudo como lido</button>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" onclick="window.setFiltroNotif('todas')" style="padding:5px 12px;border:none;border-radius:16px;font-size:12px;font-weight:700;cursor:pointer;background:${filtroNotif==='todas'?'#e7f3ff':'#f0f2f5'};color:${filtroNotif==='todas'?'#1877f2':'#050505'};">Todas</button>
          <button type="button" onclick="window.setFiltroNotif('naolidas')" style="padding:5px 12px;border:none;border-radius:16px;font-size:12px;font-weight:700;cursor:pointer;background:${filtroNotif==='naolidas'?'#e7f3ff':'#f0f2f5'};color:${filtroNotif==='naolidas'?'#1877f2':'#050505'};">Não lidas</button>
        </div>
      </div>
      <div style="overflow-y:auto;flex:1;">${itensHtml}</div>
    `;
  };

  window.setFiltroNotif = function(tipo) {
    filtroNotif = tipo;
    window.toggleDropdownNotif(true);
  };

  window.marcarTodasNotifsLidas = function() {
    const lista = getNotifs().map(n => ({ ...n, lida: true }));
    salvarNotifs(lista);
    window.toggleDropdownNotif(true);
  };

  window.abrirItemNotif = function(id) {
    const lista = getNotifs();
    const item = lista.find(n => n.id === id);
    if (item) {
      item.lida = true;
      salvarNotifs(lista);
    }
    document.getElementById("fb-notif-dropdown")?.remove();
    if (item?.acao === "messenger" && window.toggleDropdownMessenger) window.toggleDropdownMessenger();
    else if (item?.acao === "marketplace" && window.abrirMarketplaceCubos) window.abrirMarketplaceCubos();
    else if (item?.acao === "live" && window.assistirLiveFB) window.assistirLiveFB();
    else if (item?.acao === "perfil" && window.abrirPerfilCubista) window.abrirPerfilCubista();
    else if (item?.acao === "rankings") document.querySelector("[data-tab=tab-rankings]")?.click();
    else if (item?.acao === "feed") document.querySelector("[data-tab=tab-feed]")?.click();
  };

  document.addEventListener("click", () => {
    document.getElementById("fb-notif-dropdown")?.remove();
  });

  setTimeout(window.injetarBotaoNotifTopo, 300);
  document.addEventListener("DOMContentLoaded", window.injetarBotaoNotifTopo);
})();

(function() {
  const origSetItem = localStorage.setItem.bind(localStorage);

  function checarRecordesMundiaisWCA() {
    try {
      const dados = JSON.parse(localStorage.getItem("cms_wca_wr_cache") || "null");
      if (!dados) return;
      const prev = JSON.parse(localStorage.getItem("cms_wr_snapshot") || "{}");
      let mudou = false;
      Object.keys(dados).forEach(ev => {
        const atual = dados[ev];
        if (atual && prev[ev] && atual !== prev[ev]) {
          window.registrarNotificacaoCMS(`🌍 NOVO RECORDE MUNDIAL WCA em ${ev.toUpperCase()}: ${atual}!`, "🏆", "rankings");
          mudou = true;
        }
        prev[ev] = atual;
      });
      if (mudou || !Object.keys(prev).length) {
        origSetItem("cms_wr_snapshot", JSON.stringify(prev));
      }
    } catch (e) {}
  }

  localStorage.setItem = function(key, val) {
    const anterior = localStorage.getItem(key);
    origSetItem(key, val);
    try {
      const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
      if (key === "cms_msgs_v1" && anterior !== val) {
        const arr = JSON.parse(val || "[]");
        const ult = arr.at(-1);
        if (ult && ult.para === eu.e) {
          window.registrarNotificacaoCMS(`Nova mensagem de ${ult.deNome || ult.de}: "${(ult.texto || "").slice(0, 45)}"`, "💬", "messenger");
        }
      }
      if (key === "cms_perfis_v1" && anterior !== val) {
        const pNovo = JSON.parse(val || "{}")[eu.e] || {};
        const pAnt = JSON.parse(anterior || "{}")[eu.e] || {};
        const solNova = pNovo.solicitacoesRecebidas || [];
        const solAnt = pAnt.solicitacoesRecebidas || [];
        if (solNova.length > solAnt.length) {
          const quem = solNova.at(-1);
          window.registrarNotificacaoCMS(`${quem} enviou uma solicitação de amizade para você!`, "👥", "perfil");
        }
        const amgNovo = pNovo.amigos || [];
        const amgAnt = pAnt.amigos || [];
        if (amgNovo.length > amgAnt.length) {
          const novoAmg = amgNovo.at(-1);
          window.registrarNotificacaoCMS(`Você e ${novoAmg} agora são amigos no MS AO CUBO!`, "🤝", "perfil");
        }
      }
      if ((key === "cms_posts_v1" || key === "cms_feed_posts") && anterior !== val) {
        const postsNovos = JSON.parse(val || "[]");
        const postsAnt = JSON.parse(anterior || "[]");
        postsNovos.forEach(p => {
          if (p.autorEmail === eu.e) {
            const pOld = postsAnt.find(x => x.id === p.id);
            const likesNow = Object.keys(p.reacoes || {}).length || (p.likes || 0);
            const likesOld = pOld ? (Object.keys(pOld.reacoes || {}).length || (pOld.likes || 0)) : 0;
            if (likesNow > likesOld) {
              window.registrarNotificacaoCMS(`Alguém reagiu à sua publicação: "${(p.texto || "Foto/Vídeo").slice(0, 35)}"`, "❤️", "feed");
            }
            const comNow = (p.comentarios || []).length;
            const comOld = pOld ? (pOld.comentarios || []).length : 0;
            if (comNow > comOld) {
              const ultC = p.comentarios.at(-1);
              window.registrarNotificacaoCMS(`${ultC?.autor || "Um cubista"} comentou na sua publicação: "${(ultC?.texto || "").slice(0, 35)}"`, "💭", "feed");
            }
          }
        });
      }
    } catch (e) {}
  };

  
})();
