(function() {
  const MSG_KEY = "cms_msgs_v1";

  function getMensagens() {
    return JSON.parse(localStorage.getItem(MSG_KEY) || "[]");
  }

  function salvarMensagens(lista) {
    localStorage.setItem(MSG_KEY, JSON.stringify(lista));
  }

  function getCubistasChat() {
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const cadastrados = JSON.parse(localStorage.getItem("cms_u") || "[]");
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const outros = cadastrados.filter(u => u.e && u.e !== eu.e).map(u => ({
      nome: u.n,
      email: u.e,
      avatar: perfis[u.e]?.avatar || ""
    }));
    const fixos = [
      { nome: eu.n + " (Você • Notas)", email: eu.e, avatar: perfis[eu.e]?.avatar || "" },
      { nome: "Cubo Mágico MS • Oficial", email: "oficial@cubomagicoms.com.br", avatar: "" }
    ];
    return [...fixos, ...outros];
  }

  window.injetarBotaoMessengerTopo = function() {
    const nav = document.querySelector(".fb-nav-right");
    if (!nav || document.getElementById("btn-topo-messenger")) return;
    const btn = document.createElement("button");
    btn.id = "btn-topo-messenger";
    btn.className = "fb-circle-btn";
    btn.title = "Messenger";
    btn.style.position = "relative";
    btn.innerHTML = `💬<span id="msg-badge-count" style="display:none;position:absolute;top:-2px;right:-2px;background:#e41e3f;color:#fff;font-size:10px;font-weight:800;padding:1px 5px;border-radius:10px;">0</span>`;
    btn.onclick = (e) => { e.stopPropagation(); window.toggleDropdownMessenger(); };
    const perfilBtn = document.getElementById("btn-topo-meu-perfil");
    if (perfilBtn) nav.insertBefore(btn, perfilBtn);
    else nav.appendChild(btn);
  };

  window.toggleDropdownMessenger = function() {
    let drop = document.getElementById("fb-messenger-dropdown");
    if (drop) { drop.remove(); return; }
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const todas = getMensagens();
    const cubistas = getCubistasChat();

    drop = document.createElement("div");
    drop.id = "fb-messenger-dropdown";
    drop.onclick = (e) => e.stopPropagation();
    drop.style.cssText = "position:fixed;top:58px;right:16px;width:340px;max-height:480px;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.22);border:1px solid #dddfe2;z-index:99999;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;";

    const listaHtml = cubistas.map(c => {
      const conv = todas.filter(m => (m.de === eu.e && m.para === c.email) || (m.de === c.email && m.para === eu.e));
      const ult = conv.at(-1);
      const av = c.avatar
        ? `<img src="${c.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:44px;height:44px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;">${c.nome.slice(0,2).toUpperCase()}</div>`;
      return `<div onclick="document.getElementById('fb-messenger-dropdown')?.remove();window.abrirJanelaChatFB('${c.email}','${c.nome.replace(/'/g,"\\'")}')" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f0f2f5;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='#fff'">
        <div style="position:relative;">${av}<span style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#31a24c;border:2px solid #fff;"></span></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:14px;color:#050505;">${c.nome}</div>
          <div style="font-size:12px;color:#65676b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ult ? ult.texto : "Clique para iniciar conversa"}</div>
        </div>
      </div>`;
    }).join("") || `<div style="padding:16px;text-align:center;color:#65676b;font-size:13px;">Nenhum outro cubista cadastrado ainda.</div>`;

    drop.innerHTML = `
      <div style="padding:12px 16px;border-bottom:1px solid #e4e6eb;display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:18px;font-weight:800;">Bate-papos</strong>
        <span style="font-size:11px;color:#1877f2;font-weight:700;">Messenger CMS</span>
      </div>
      <div style="overflow-y:auto;flex:1;">${listaHtml}</div>
    `;
    document.body.appendChild(drop);
  };

  document.addEventListener("click", () => {
    const drop = document.getElementById("fb-messenger-dropdown");
    if (drop) drop.remove();
  });

  window.abrirJanelaChatFB = function(emailAlvo, nomeAlvo) {
    let box = document.getElementById("fb-chat-dock");
    if (box) box.remove();
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const av = perfis[emailAlvo]?.avatar || "";

    box = document.createElement("div");
    box.id = "fb-chat-dock";
    box.style.cssText = "position:fixed;bottom:0;right:24px;width:328px;height:420px;background:#fff;border-radius:12px 12px 0 0;box-shadow:0 4px 24px rgba(0,0,0,0.22);border:1px solid #dddfe2;z-index:99998;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;";
    box.innerHTML = `
      <div style="padding:10px 12px;background:#fff;border-bottom:1px solid #e4e6eb;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 2px rgba(0,0,0,0.06);">
        <div onclick="if(window.abrirPerfilCubista) window.abrirPerfilCubista('${emailAlvo}')" style="display:flex;align-items:center;gap:8px;cursor:pointer;min-width:0;">
          <div style="position:relative;flex-shrink:0;">
            ${av ? `<img src="${av}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">` : `<div style="width:34px;height:34px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${(nomeAlvo||"CM").slice(0,2).toUpperCase()}</div>`}
            <span style="position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:#31a24c;border:2px solid #fff;"></span>
          </div>
          <div style="min-width:0;">
            <div style="font-weight:700;font-size:13px;color:#050505;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nomeAlvo}</div>
            <div style="font-size:11px;color:#31a24c;font-weight:600;">Online agora</div>
          </div>
        </div>
        <div style="display:flex;gap:4px;">
          <button type="button" onclick="const d=document.getElementById('fb-chat-dock');d.style.height=(d.style.height==='48px'?'420px':'48px');" style="border:none;background:none;color:#1877f2;font-size:18px;font-weight:bold;cursor:pointer;padding:2px 6px;">—</button>
          <button type="button" onclick="document.getElementById('fb-chat-dock').remove()" style="border:none;background:none;color:#1877f2;font-size:16px;font-weight:bold;cursor:pointer;padding:2px 6px;">✕</button>
        </div>
      </div>
      <div id="fb-chat-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#fff;"></div>
      <form onsubmit="window.enviarMensagemChatFB(event,'${emailAlvo}','${(nomeAlvo||'').replace(/'/g,"\\'")}')" style="padding:8px 10px;border-top:1px solid #e4e6eb;display:flex;align-items:center;gap:6px;background:#fff;">
        <label title="Enviar foto" style="cursor:pointer;font-size:18px;padding:2px 4px;">🖼️<input type="file" accept="image/*" onchange="window.enviarFotoChatFB(this,'${emailAlvo}','${(nomeAlvo||'').replace(/'/g,"\\'")}')" style="display:none;"></label>
        <input id="fb-chat-input" placeholder="Aa" autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:8px 12px;font-size:13px;outline:none;">
        <button type="button" onclick="window.enviarTextoDiretoChat('${emailAlvo}','${(nomeAlvo||'').replace(/'/g,"\\'")}','👍')" style="border:none;background:none;font-size:19px;cursor:pointer;">👍</button>
        <button type="submit" style="border:none;background:#1877f2;color:#fff;border-radius:50%;width:30px;height:30px;font-weight:bold;cursor:pointer;">➤</button>
      </form>
    `;
    document.body.appendChild(box);
    window.renderMensagensChatFB(emailAlvo);
    document.getElementById("fb-chat-input")?.focus();
  };

  window.renderMensagensChatFB = function(emailAlvo) {
    const area = document.getElementById("fb-chat-messages");
    if (!area) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
    const conv = getMensagens().filter(m => (m.de === eu.e && m.para === emailAlvo) || (m.de === emailAlvo && m.para === eu.e));
    area.innerHTML = conv.map(m => {
      const souEu = m.de === eu.e;
      const corpo = m.img ? `<img src="${m.img}" style="max-width:180px;border-radius:10px;display:block;">` : `<span>${m.texto}</span>`;
      return `<div style="display:flex;flex-direction:column;align-items:${souEu ? 'flex-end' : 'flex-start'};">
        <div style="max-width:78%;padding:8px 12px;border-radius:16px;font-size:13px;line-height:1.35;background:${souEu ? '#0084ff' : '#e4e6eb'};color:${souEu ? '#fff' : '#050505'};">${corpo}</div>
        <span style="font-size:10px;color:#65676b;margin-top:2px;">${m.hora || ""}</span>
      </div>`;
    }).join("") || `<div style="text-align:center;color:#65676b;font-size:12px;margin-top:40px;">Diga oi! As respostas dos Stories também aparecem aqui.</div>`;
    area.scrollTop = area.scrollHeight;
  };

  window.enviarTextoDiretoChat = function(emailAlvo, nomeAlvo, texto, imgData) {
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const lista = getMensagens();
    lista.push({ id: Date.now(), de: eu.e, deNome: eu.n, para: emailAlvo, texto: texto || "", img: imgData || "", hora: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) });
    salvarMensagens(lista);
    window.renderMensagensChatFB(emailAlvo);
  };

  window.enviarMensagemChatFB = function(e, emailAlvo, nomeAlvo) {
    e.preventDefault();
    const inp = document.getElementById("fb-chat-input");
    const txt = inp?.value.trim();
    if (!txt) return;
    inp.value = "";
    window.enviarTextoDiretoChat(emailAlvo, nomeAlvo, txt);
  };

  window.enviarFotoChatFB = function(inp, emailAlvo, nomeAlvo) {
    const f = inp.files && inp.files.item(0);
    if (!f) return;
    if (window.otimizarImagemCDN) { window.otimizarImagemCDN(f, 900, 0.80).then(opt => window.enviarTextoDiretoChat(emailAlvo, nomeAlvo, "📷 Foto", opt)); } else { const r = new FileReader(); r.onload = (ev) => window.enviarTextoDiretoChat(emailAlvo, nomeAlvo, "📷 Foto", ev.target.result); r.readAsDataURL(f); }
  };

  setTimeout(window.injetarBotaoMessengerTopo, 300);
  document.addEventListener("DOMContentLoaded", window.injetarBotaoMessengerTopo);
})();
