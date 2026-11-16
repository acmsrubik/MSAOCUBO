(function() {
  // 1. Corrigir o vão do hover dos emojis para não fechar ao subir o mouse
  const fixStyle = document.createElement("style");
  fixStyle.textContent = `
    .reaction-bar {
      margin-bottom: 0 !important;
      bottom: calc(100% - 2px) !important;
      padding: 8px 12px !important;
    }
    .reaction-bar::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      height: 12px;
      background: transparent;
    }
    .reaction-wrapper.open .reaction-bar {
      display: flex !important;
    }
    .post-media, #perfil-render-area img {
      cursor: pointer;
    }
  `;
  document.head.appendChild(fixStyle);

  // 2. Criar o Visualizador de Foto estilo Facebook (Lightbox)
  const modal = document.createElement("div");
  modal.id = "fb-photo-viewer";
  modal.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:100000;font-family:'Segoe UI',Helvetica,Arial,sans-serif;";
  document.body.appendChild(modal);

  let postAtualId = null;

  window.abrirFotoFacebook = function(srcImg, postId) {
    postAtualId = postId || null;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    window.renderFotoViewer(srcImg);
  };

  window.fecharFotoFacebook = function() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    postAtualId = null;
  };

  window.renderFotoViewer = function(srcImg) {
    const lista = typeof postsCubistas !== "undefined" ? postsCubistas : JSON.parse(localStorage.getItem("cms_feed_v2") || "[]");
    const p = postAtualId ? lista.find(x => x.id === postAtualId) : lista.find(x => x.midia === srcImg);
    const imgFinal = srcImg || (p ? p.midia : "");

    if (!p) {
      modal.innerHTML = `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;" onclick="if(event.target===this)window.fecharFotoFacebook()">
          <button onclick="window.fecharFotoFacebook()" style="position:absolute;top:16px;left:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);color:#fff;border:none;font-size:20px;cursor:pointer;">✕</button>
          <img src="${imgFinal}" style="max-width:92vw;max-height:92vh;object-fit:contain;border-radius:4px;">
        </div>`;
      return;
    }

    const totalReacoes = Object.values(p.reacoes || {}).reduce((a, b) => a + b, 0);
    const emojisAtivos = Object.entries(p.reacoes || {}).filter(([, v]) => v > 0).map(([k]) => k).join("");
    const coms = p.comentarios || [];

    modal.innerHTML = `
      <div style="display:flex;width:100%;height:100%;flex-wrap:wrap;">
        <!-- Lado Esquerdo: Imagem escura estilo Facebook -->
        <div style="flex:1;min-width:300px;background:#000;display:flex;align-items:center;justify-content:center;position:relative;" onclick="if(event.target===this)window.fecharFotoFacebook()">
          <button onclick="window.fecharFotoFacebook()" title="Fechar" style="position:absolute;top:16px;left:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);color:#fff;border:none;font-size:20px;cursor:pointer;z-index:10;">✕</button>
          <img src="${imgFinal}" style="max-width:100%;max-height:100vh;object-fit:contain;">
        </div>

        <!-- Lado Direito: Painel branco estilo Facebook com Curtidas e Comentários -->
        <div style="width:380px;max-width:100%;background:#fff;height:100%;display:flex;flex-direction:column;border-left:1px solid #dddfe2;">
          <div style="padding:14px 16px;border-bottom:1px solid #e4e6eb;display:flex;align-items:center;gap:10px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#1877f2;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;">${(p.iniciais || "CM")}</div>
            <div>
              <div style="font-weight:700;font-size:15px;color:#050505;">${p.autor}</div>
              <div style="font-size:12px;color:#65676b;">${p.data}</div>
            </div>
          </div>

          <div style="padding:12px 16px;font-size:15px;color:#050505;border-bottom:1px solid #e4e6eb;">
            ${p.texto || ""}
            ${p.tempo ? `<div class="solve-badge" style="margin-top:8px;">⏱️ <strong>${p.tempo}</strong> (${p.mod})</div>` : ""}
          </div>

          <!-- Barra de Emojis sempre acessível no visualizador -->
          <div style="padding:10px 16px;border-bottom:1px solid #e4e6eb;">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#65676b;margin-bottom:8px;">
              <span>${totalReacoes > 0 ? `${emojisAtivos} ${totalReacoes} reações` : "Escolha uma reação abaixo:"}</span>
              <span>${coms.length} comentários</span>
            </div>
            <div style="display:flex;justify-content:space-around;background:#f0f2f5;padding:6px;border-radius:24px;">
              ${["👍","❤️","🔥","🤯","👏","🧊","🏆"].map(em => `
                <button onclick="reagirPost(${p.id},'${em}');window.renderFotoViewer('${imgFinal}');if(window.renderPerfil)window.renderPerfil();" style="font-size:22px;background:${p.minhaReacao===em?'#dce7f7':'none'};border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;transition:0.15s;" title="Reagir com ${em}">${em}</button>
              `).join("")}
            </div>
          </div>

          <!-- Lista de comentários -->
          <div style="flex:1;overflow-y:auto;padding:12px 16px;">
            ${coms.map(c => `
              <div style="margin-bottom:10px;">
                <div class="comment-bubble">
                  <strong style="font-size:12px;color:#050505;">${c.autor}</strong>
                  <div style="color:#050505;">${c.texto}</div>
                </div>
              </div>
            `).join("") || `<div style="text-align:center;color:#65676b;font-size:13px;margin-top:20px;">Nenhum comentário nesta foto ainda.</div>`}
          </div>

          <!-- Campo para comentar -->
          <form onsubmit="event.preventDefault();const inp=document.getElementById('lb-com-inp');if(!inp.value.trim())return;const post=postsCubistas.find(x=>x.id===${p.id});if(post){post.comentarios.push({id:Date.now(),autor:(window.getUsuarioAtualCMS?window.getUsuarioAtualCMS().n:'Jefferson'),texto:inp.value.trim(),likes:0,liked:false,respostas:[]});salvarFeed();renderFeed();if(window.renderPerfil)window.renderPerfil();window.renderFotoViewer('${imgFinal}');}" style="padding:10px 14px;border-top:1px solid #e4e6eb;display:flex;gap:8px;background:#fff;">
            <input id="lb-com-inp" placeholder="Escreva um comentário..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:20px;padding:9px 14px;font-size:13px;outline:none;">
            <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:18px;padding:6px 14px;font-weight:700;font-size:13px;cursor:pointer;">Enviar</button>
          </form>
        </div>
      </div>
    `;
  };

  // 3. Interceptar clique em qualquer imagem de post ou galeria e tecla ESC
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img.post-media, #perfil-render-area img");
    if (img && img.src && !img.src.includes("data:image") || (img && img.classList.contains("post-media"))) {
      e.preventDefault();
      window.abrirFotoFacebook(img.src, null);
    }
    // Se clicar fora da barra de emojis aberta, fecha ela
    if (!e.target.closest(".reaction-wrapper")) {
      document.querySelectorAll(".reaction-wrapper.open").forEach(w => w.classList.remove("open"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") window.fecharFotoFacebook();
  });
})();
