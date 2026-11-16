window.renderPostsDoPerfil = function(postsDoUsuario, iniciais) {
  if (!postsDoUsuario.length) {
    return `<div class="social-card" style="text-align:center;color:#65676b;padding:30px;">Nenhuma publicação neste perfil ainda.</div>`;
  }
  return postsDoUsuario.map(p => {
    const totalReacoes = Object.values(p.reacoes || {}).reduce((a, b) => a + b, 0);
    const emojisAtivos = Object.entries(p.reacoes || {}).filter(([, v]) => v > 0).map(([k]) => k).join("");
    const coms = p.comentarios || [];
    const comsHtml = coms.map((c, cIdx) => {
      const resps = (c.respostas || []).map((r, rIdx) => `
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
      `).join("");

      return `
        <div style="margin-top:8px;">
          <div class="comment-bubble">
            <strong style="font-size:12px;color:#050505;">${c.autor}:</strong> <span style="color:#050505;">${c.texto}</span>
          </div>
          <div class="comment-meta">
            <span onclick="if(typeof curtirComentario==='function'){curtirComentario(${p.id},${cIdx});if(window.renderPerfil)window.renderPerfil();}">
              👍 Curtir ${c.likes ? `(${c.likes})` : ""}
            </span>
            <span onclick="if(typeof window.abrirRespostaInline==='function'){window.abrirRespostaInline(this,${p.id},${cIdx});}">
              Responder
            </span>
          </div>
          ${resps}
        </div>
      `;
    }).join("");

    return `
      <div class="social-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:40px;height:40px;border-radius:50%;background:#1877f2;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;">${iniciais}</div>
          <div>
            <div style="font-weight:700;font-size:14px;color:#050505;">${p.autor}</div>
            <div style="font-size:12px;color:#65676b;">${p.data}</div>
          </div>
        </div>
        <p style="margin:6px 0;font-size:15px;color:#050505;">${p.texto}</p>
        ${p.tempo ? `<div class="solve-badge">⏱️ <strong>${p.tempo}</strong> (${p.mod})</div>` : ""}
        ${p.midia && p.tipoMidia === "imagem" ? `<img src="${p.midia}" class="post-media">` : ""}
        ${p.midia && p.tipoMidia === "video" ? `<video src="${p.midia}" controls class="post-media"></video>` : ""}

        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0 6px;font-size:13px;color:#65676b;border-bottom:1px solid #e4e6eb;margin-top:8px;">
          <div>${totalReacoes > 0 ? `${emojisAtivos} ${totalReacoes} ${totalReacoes === 1 ? "reação" : "reações"}` : "Seja o primeiro a curtir"}</div>
          <div>${coms.length} ${coms.length === 1 ? "comentário" : "comentários"}</div>
        </div>

        <div style="display:flex;gap:6px;padding:4px 0;border-bottom:1px solid #e4e6eb;">
          <div class="reaction-wrapper">
            <div class="reaction-bar">
              ${["👍","❤️","🔥","🤯","👏"].map(em => `
                <button class="react-emoji" onclick="reagirPost(${p.id},'${em}');if(window.renderPerfil)window.renderPerfil();">${em}</button>
              `).join("")}
            </div>
            <button class="btn-social-gray" style="width:100%;color:${p.minhaReacao ? "#1877f2" : "#65676b"};font-weight:700;" onclick="reagirPost(${p.id},'${p.minhaReacao || "👍"}');if(window.renderPerfil)window.renderPerfil();">
              ${p.minhaReacao || "👍"} Curtir
            </button>
          </div>
          <button class="btn-social-gray" style="flex:1;font-weight:700;" onclick="document.getElementById('prof-com-${p.id}')?.focus()">
            💬 Comentar
          </button>
        </div>

        <div style="margin-top:8px;">
          ${comsHtml}
          <form onsubmit="event.preventDefault();const inp=document.getElementById('prof-com-${p.id}');if(!inp.value.trim())return;const post=postsCubistas.find(x=>x.id===${p.id});if(post){post.comentarios.push({id:Date.now(),autor:(window.getUsuarioAtualCMS?window.getUsuarioAtualCMS().n:'Jefferson'),texto:inp.value.trim(),likes:0,liked:false,respostas:[]});salvarFeed();renderFeed();if(window.renderPerfil)window.renderPerfil();}" style="display:flex;gap:8px;margin-top:8px;">
            <input id="prof-com-${p.id}" placeholder="Escreva um comentário..." style="flex:1;background:#f0f2f5;border:none;border-radius:20px;padding:8px 14px;font-size:13px;outline:none;">
            <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:18px;padding:6px 14px;font-weight:700;font-size:13px;cursor:pointer;">Enviar</button>
          </form>
        </div>
      </div>
    `;
  }).join("");
};
