(function() {
  // 1. Impede que o navegador abra o popup cinza antigo de prompt
  window.prompt = function() { return null; };

  // 2. Intercepta qualquer clique na palavra "Responder" no Feed ou no Perfil
  document.addEventListener("click", function(e) {
    const btn = e.target.closest(".comment-meta span");
    if (!btn || btn.textContent.trim() !== "Responder") return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const meta = btn.closest(".comment-meta");
    if (!meta) return;

    // Se a caixinha já estiver aberta abaixo desse comentário, fecha
    const prox = meta.nextElementSibling;
    if (prox && prox.classList.contains("fb-reply-inline-form")) {
      prox.remove();
      return;
    }

    // Descobre qual post e qual comentário foram clicados
    const card = meta.closest(".social-card");
    const allCards = Array.from(document.querySelectorAll("#tab-feed .social-card, #perfil-render-area .social-card"));
    const metasDoCard = Array.from(card.querySelectorAll(".comment-meta"));
    const comIdx = metasDoCard.indexOf(meta);

    // Pega o ID do post a partir do input de comentário do mesmo card
    const inpCom = card.querySelector("input[id^='inp-com-'], input[id^='prof-com-']");
    const postId = inpCom ? Number(inpCom.id.replace("inp-com-", "").replace("prof-com-", "")) : null;
    const p = (typeof postsCubistas !== "undefined") ? postsCubistas.find(x => x.id === postId) : null;
    if (!p || !p.comentarios[comIdx]) return;

    const form = document.createElement("form");
    form.className = "fb-reply-inline-form";
    form.style.cssText = "display:flex;gap:6px;margin:6px 0 8px 24px;align-items:center;";
    form.innerHTML = `
      <input type="text" placeholder="Responder a ${p.comentarios[comIdx].autor}..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:7px 12px;font-size:12px;outline:none;">
      <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>
    `;

    form.onsubmit = function(ev) {
      ev.preventDefault();
      const txt = form.querySelector("input").value.trim();
      if (!txt) return;
      const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
      p.comentarios[comIdx].respostas = p.comentarios[comIdx].respostas || [];
      p.comentarios[comIdx].respostas.push({ autor: eu, texto: txt });
      if (typeof salvarFeed === "function") salvarFeed();
      if (typeof renderFeed === "function") renderFeed();
      if (window.renderPerfil) window.renderPerfil();
    };

    meta.insertAdjacentElement("afterend", form);
    form.querySelector("input").focus();
  }, true);

  window.curtirResposta = function(postId, comIdx, repIdx) {
    if (typeof postsCubistas === "undefined") return;
    const p = postsCubistas.find(x => x.id === postId);
    const r = p?.comentarios?.[comIdx]?.respostas?.[repIdx];
    if (!r) return;
    r.liked = !r.liked;
    r.likes = (r.likes || 0) + (r.liked ? 1 : -1);
    if (r.likes < 0) r.likes = 0;
    if (typeof salvarFeed === "function") salvarFeed();
    if (typeof renderFeed === "function") renderFeed();
    if (window.renderPerfil) window.renderPerfil();
  };

  window.responderNaResposta = function(el, postId, comIdx, autorAlvo) {
    const meta = el.closest(".comment-meta");
    if (!meta) return;
    const prox = meta.nextElementSibling;
    if (prox && prox.classList.contains("fb-reply-inline-form")) { prox.remove(); return; }
    const p = (typeof postsCubistas !== "undefined") ? postsCubistas.find(x => x.id === postId) : null;
    if (!p || !p.comentarios[comIdx]) return;
    const form = document.createElement("form");
    form.className = "fb-reply-inline-form";
    form.style.cssText = "display:flex;gap:6px;margin:4px 0 8px 10px;align-items:center;";
    form.innerHTML = `<input type="text" value="@${autorAlvo} " autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:6px 12px;font-size:12px;outline:none;"><button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>`;
    form.onsubmit = function(ev) {
      ev.preventDefault();
      const txt = form.querySelector("input").value.trim();
      if (!txt) return;
      const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
      p.comentarios[comIdx].respostas.push({ autor: eu, texto: txt, likes: 0, liked: false });
      if (typeof salvarFeed === "function") salvarFeed();
      if (typeof renderFeed === "function") renderFeed();
      if (window.renderPerfil) window.renderPerfil();
    };
    meta.insertAdjacentElement("afterend", form);
    const inp = form.querySelector("input");
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  };

})();
