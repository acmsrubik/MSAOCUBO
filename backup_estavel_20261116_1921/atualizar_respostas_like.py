# 1. Atualizar perfil_posts.js para incluir Curtir e Responder nas respostas
with open("perfil_posts.js", "r", encoding="utf-8") as f:
    pcode = f.read()

old_resp_block = """      const resps = (c.respostas || []).map(r => `
        <div class="reply-list">
          <div class="comment-bubble">
            <strong style="font-size:12px;color:#050505;">${r.autor}:</strong> <span style="color:#050505;">${r.texto}</span>
          </div>
        </div>
      `).join("");"""

new_resp_block = """      const resps = (c.respostas || []).map((r, rIdx) => `
        <div class="reply-list">
          <div class="comment-bubble">
            <strong style="font-size:12px;color:#050505;">${r.autor}:</strong> <span style="color:#050505;">${r.texto}</span>
          </div>
          <div class="comment-meta" data-reply-idx="${rIdx}">
            <span onclick="window.curtirResposta(${p.id},${cIdx},${rIdx})">
              👍 Curtir ${r.likes ? `(${r.likes})` : ""}
            </span>
            <span onclick="window.responderNaResposta(this,${p.id},${cIdx},'${(r.autor||"").replace(/'/g,"")}')">
              Responder
            </span>
          </div>
        </div>
      `).join("");"""

if old_resp_block in pcode:
    pcode = pcode.replace(old_resp_block, new_resp_block)
    with open("perfil_posts.js", "w", encoding="utf-8") as f:
        f.write(pcode)

# 2. Atualizar fix_resposta_direta.js com as funções globais curtirResposta e responderNaResposta
with open("fix_resposta_direta.js", "r", encoding="utf-8") as f:
    fcode = f.read()

funcoes_extra = """
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
"""

if "window.curtirResposta" not in fcode:
    fcode = fcode.replace("})();", funcoes_extra + "\n})();")
    with open("fix_resposta_direta.js", "w", encoding="utf-8") as f:
        f.write(fcode)

# 3. Também injeta Curtir e Responder nas respostas do feed.js principal
with open("feed.js", "r", encoding="utf-8") as f:
    feed_txt = f.read()

feed_txt = feed_txt.replace(
    '<div class="reply-list"><div class="comment-bubble"><strong>${r.autor}:</strong> ${r.texto}</div></div>',
    '<div class="reply-list"><div class="comment-bubble"><strong>${r.autor}:</strong> ${r.texto}</div><div class="comment-meta"><span onclick="window.curtirResposta(${p.id},${idx},${rIdx})">👍 Curtir ${r.likes ? `(${r.likes})` : ""}</span><span onclick="window.responderNaResposta(this,${p.id},${idx},\'${r.autor}\')">Responder</span></div></div>'
)
feed_txt = feed_txt.replace(".respostas || []).map(r =>", ".respostas || []).map((r, rIdx) =>")
with open("feed.js", "w", encoding="utf-8") as f:
    f.write(feed_txt)

# 4. Atualiza versão no index.html para limpar cache
h = open("index.html", encoding="utf-8").read()
h = h.replace("?v=1", "?v=5").replace("?v=4", "?v=5")
open("index.html", "w", encoding="utf-8").write(h)
print("✅ Curtir e Responder adicionados em todas as respostas!")
