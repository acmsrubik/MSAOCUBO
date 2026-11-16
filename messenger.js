(function() {
  function getEu() {
    return window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  }

  function getContatosChat() {
    const eu = getEu();
    const cadastrados = JSON.parse(localStorage.getItem("cms_u") || "[]");
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const amigosEmails = perfis[eu.e]?.amigos || [];
    const mapa = new Map();
    cadastrados.forEach(u => { if (u && u.e && u.e !== eu.e) mapa.set(u.e, u); });
    const lista = Array.from(mapa.values());
    lista.sort((a, b) => (amigosEmails.includes(b.e) ? 1 : 0) - (amigosEmails.includes(a.e) ? 1 : 0));
    return { lista, amigosEmails, perfis };
  }

  function getChaveSala(e1, e2) {
    return [e1, e2].sort().join("__");
  }

  function getMensagens(e1, e2) {
    const all = JSON.parse(localStorage.getItem("cms_chat_v1") || "{}");
    return all[getChaveSala(e1, e2)] || [];
  }

  function salvarMensagem(e1, e2, remetenteEmail, texto) {
    const all = JSON.parse(localStorage.getItem("cms_chat_v1") || "{}");
    const chave = getChaveSala(e1, e2);
    if (!all[chave]) all[chave] = [];
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    all[chave].push({ de: remetenteEmail, texto, hora });
    localStorage.setItem("cms_chat_v1", JSON.stringify(all));
  }

  let chatAberto = false;
  let amigoAtivo = null;
  const widget = document.createElement("div");
  widget.id = "cms-messenger-box";
  widget.style.cssText = "display:none;position:fixed;bottom:0;right:80px;width:330px;height:440px;background:#fff;border-radius:10px 10px 0 0;box-shadow:0 4px 20px rgba(0,0,0,0.22);z-index:9998;flex-direction:column;overflow:hidden;border:1px solid #dddfe2;font-family:'Segoe UI',Helvetica,Arial,sans-serif;";
  document.body.appendChild(widget);

  window.abrirMessengerCom = function(emailAmigo, nomeAmigo) {
    chatAberto = true;
    amigoAtivo = emailAmigo ? { e: emailAmigo, n: nomeAmigo || emailAmigo } : null;
    widget.style.display = "flex";
    window.renderMessenger();
  };

  window.fecharMessenger = function() {
    chatAberto = false;
    widget.style.display = "none";
  };

  window.enviarMsgChat = function(e) {
    if (e) e.preventDefault();
    const inp = document.getElementById("msg-chat-input");
    if (!inp || !inp.value.trim() || !amigoAtivo) return;
    const eu = getEu();
    salvarMensagem(eu.e, amigoAtivo.e, eu.e, inp.value.trim());
    inp.value = "";
    window.renderMessenger();
  };

  window.enviarScrambleChat = function() {
    if (!amigoAtivo) return;
    const moves = ["R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"];
    let scr = [], last = "";
    while (scr.length < 18) {
      const m = moves[Math.floor(Math.random() * moves.length)];
      if (m !== last) { scr.push(m); last = m; }
    }
    const eu = getEu();
    salvarMensagem(eu.e, amigoAtivo.e, eu.e, "🎲 Desafio 3x3: " + scr.join(" "));
    window.renderMessenger();
  };
  window.renderMessenger = function() {
    const eu = getEu();
    const { lista, amigosEmails, perfis } = getContatosChat();

    if (!amigoAtivo) {
      const filtro = (document.getElementById("msg-search-contact")?.value || "").toLowerCase();
      const filtrados = lista.filter(c => c.n.toLowerCase().includes(filtro));
      const itensHtml = filtrados.length ? filtrados.map(c => {
        const isAmigo = amigosEmails.includes(c.e);
        const av = perfis[c.e]?.avatar;
        const ini = c.n.slice(0, 2).toUpperCase();
        const avHtml = av
          ? `<img src="${av}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`
          : `<div style="width:40px;height:40px;border-radius:50%;background:#1877f2;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;">${ini}</div>`;
        return `
          <div onclick="window.abrirMessengerCom('${c.e}', '${c.n.replace(/'/g, "")}')" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='transparent'">
            ${avHtml}
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;color:#050505;">${c.n}</div>
              <div style="font-size:12px;color:#65676b;">${isAmigo ? "✓ Amigo • Clique para conversar" : "Cubista cadastrado"}</div>
            </div>
          </div>`;
      }).join("") : `<div style="padding:24px;text-align:center;color:#65676b;font-size:13px;">Nenhum outro cubista cadastrado ainda. Crie uma segunda conta na aba de login para testar o bate-papo!</div>`;

      widget.innerHTML = `
        <div style="padding:12px 14px;border-bottom:1px solid #e4e6eb;display:flex;justify-content:space-between;align-items:center;background:#fff;">
          <strong style="font-size:16px;color:#050505;">💬 Nova mensagem</strong>
          <button onclick="window.fecharMessenger()" style="border:none;background:none;font-size:18px;cursor:pointer;color:#65676b;">✕</button>
        </div>
        <div style="padding:8px 12px;border-bottom:1px solid #e4e6eb;">
          <input id="msg-search-contact" oninput="window.renderMessenger()" value="${filtro}" placeholder="Para: Digite o nome do cubista..." style="width:100%;border:none;outline:none;font-size:14px;background:transparent;">
        </div>
        <div style="flex:1;overflow-y:auto;padding:6px;">${itensHtml}</div>
      `;
    } else {
      const msgs = getMensagens(eu.e, amigoAtivo.e);
      const msgsHtml = msgs.length ? msgs.map(m => {
        const souEu = m.de === eu.e;
        return `
          <div style="display:flex;flex-direction:column;align-items:${souEu ? "flex-end" : "flex-start"};margin-bottom:8px;">
            <div style="max-width:78%;padding:8px 12px;border-radius:16px;font-size:14px;background:${souEu ? "#1877f2" : "#e4e6eb"};color:${souEu ? "#fff" : "#050505"};word-break:break-word;">
              ${m.texto}
            </div>
            <span style="font-size:10px;color:#65676b;margin:2px 6px 0;">${m.hora}</span>
          </div>`;
      }).join("") : `<div style="text-align:center;color:#65676b;font-size:13px;margin-top:40px;">Diga oi para <strong>${amigoAtivo.n}</strong> ou envie um scramble 3x3! 🧊</div>`;

      widget.innerHTML = `
        <div style="padding:10px 12px;border-bottom:1px solid #e4e6eb;display:flex;justify-content:space-between;align-items:center;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          <div style="display:flex;align-items:center;gap:8px;">
            <button onclick="window.abrirMessengerCom(null)" title="Voltar" style="border:none;background:none;font-size:16px;cursor:pointer;color:#1877f2;font-weight:bold;">←</button>
            <div style="width:32px;height:32px;border-radius:50%;background:#1877f2;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">${amigoAtivo.n.slice(0,2).toUpperCase()}</div>
            <div>
              <div style="font-weight:700;font-size:14px;color:#050505;line-height:1.1;">${amigoAtivo.n}</div>
              <div style="font-size:11px;color:#31a24c;font-weight:600;">● Ativo agora</div>
            </div>
          </div>
          <button onclick="window.fecharMessenger()" style="border:none;background:none;font-size:18px;cursor:pointer;color:#65676b;">✕</button>
        </div>
        <div id="msg-chat-scroll" style="flex:1;overflow-y:auto;padding:12px;background:#fff;">${msgsHtml}</div>
        <form onsubmit="window.enviarMsgChat(event)" style="padding:8px;border-top:1px solid #e4e6eb;display:flex;gap:6px;align-items:center;background:#fff;">
          <button type="button" onclick="window.enviarScrambleChat()" title="Enviar Scramble 3x3" style="border:none;background:#f0f2f5;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:15px;">🎲</button>
          <input id="msg-chat-input" placeholder="Aa" autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:20px;padding:8px 14px;font-size:14px;outline:none;">
          <button type="submit" style="border:none;background:none;color:#1877f2;font-weight:800;font-size:16px;cursor:pointer;padding:0 6px;">➤</button>
        </form>
      `;
      const scrBox = document.getElementById("msg-chat-scroll");
      if (scrBox) scrBox.scrollTop = scrBox.scrollHeight;
      setTimeout(() => document.getElementById("msg-chat-input")?.focus(), 50);
    }
  };

  setTimeout(() => {
    const btnMsg = document.getElementById("fb-new-msg-btn");
    if (btnMsg) {
      btnMsg.onclick = () => {
        if (chatAberto) window.fecharMessenger();
        else window.abrirMessengerCom(null);
      };
    }
  }, 400);
})();
