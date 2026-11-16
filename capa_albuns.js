(function() {
  window.abrirModalFotoPerfilCapa = function(input, tipo, email) {
    const file = input.files && input.files.item(0);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgData = e.target.result;
      const isCapa = tipo === "capa";
      let posY = 50;

      const modal = document.createElement("div");
      modal.id = "modal-crop-fb";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;";

      modal.innerHTML = `
        <div style="background:#fff;border-radius:10px;max-width:680px;width:100%;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.3);">
          <div style="padding:14px 18px;border-bottom:1px solid #e4e6eb;display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:18px;color:#050505;">${isCapa ? "Atualizar foto da capa" : "Atualizar foto do perfil"}</strong>
            <button id="fechar-modal-crop" style="border:none;background:#e4e6eb;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;">✕</button>
          </div>

          <div style="padding:16px;">
            <textarea id="legenda-nova-foto" rows="2" placeholder="Escreva algo sobre sua ${isCapa ? "nova foto da capa" : "nova foto do perfil"}..." style="width:100%;border:1px solid #dddfe2;border-radius:8px;padding:10px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:12px;font-family:inherit;"></textarea>

            ${isCapa ? `
              <div style="background:#f0f2f5;padding:8px 12px;border-radius:8px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <span style="font-size:13px;font-weight:700;color:#050505;">↕️ Ajustar posição vertical da capa:</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <button type="button" id="btn-capa-subir" style="background:#fff;border:1px solid #ccc;border-radius:6px;padding:4px 10px;font-weight:700;cursor:pointer;">⬆️ Subir</button>
                  <input type="range" id="range-capa-y" min="0" max="100" value="50" style="cursor:pointer;">
                  <button type="button" id="btn-capa-descer" style="background:#fff;border:1px solid #ccc;border-radius:6px;padding:4px 10px;font-weight:700;cursor:pointer;">⬇️ Descer</button>
                </div>
              </div>
              <div id="preview-capa-box" style="width:100%;height:240px;border-radius:8px;background-image:url('${imgData}');background-size:cover;background-position:center 50%;border:1px solid #dddfe2;"></div>
            ` : `
              <div style="display:flex;justify-content:center;padding:10px;">
                <img src="${imgData}" style="width:190px;height:190px;border-radius:50%;object-fit:cover;border:4px solid #1877f2;">
              </div>
            `}
          </div>

          <div style="padding:12px 18px;border-top:1px solid #e4e6eb;display:flex;justify-content:flex-end;gap:10px;background:#f8f9fa;">
            <a href="${imgData}" download="foto-cubo-ms.png" style="padding:8px 14px;border-radius:6px;background:#e4e6eb;color:#050505;text-decoration:none;font-weight:600;font-size:14px;">⬇️ Baixar foto</a><button id="cancelar-modal-crop" style="padding:8px 16px;border:none;border-radius:6px;background:#e4e6eb;font-weight:600;cursor:pointer;">Cancelar</button>
            <button id="salvar-modal-crop" style="padding:8px 20px;border:none;border-radius:6px;background:#1877f2;color:#fff;font-weight:700;cursor:pointer;">Salvar e Publicar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      const fechar = () => { modal.remove(); input.value = ""; };
      document.getElementById("fechar-modal-crop").onclick = fechar;
      document.getElementById("cancelar-modal-crop").onclick = fechar;

      if (isCapa) {
        const boxPrev = document.getElementById("preview-capa-box");
        const rng = document.getElementById("range-capa-y");
        const atualizarPos = (val) => {
          posY = Math.max(0, Math.min(100, Number(val)));
          rng.value = posY;
          boxPrev.style.backgroundPosition = `center ${posY}%`;
        };
        rng.oninput = (ev) => atualizarPos(ev.target.value);
        document.getElementById("btn-capa-subir").onclick = () => atualizarPos(posY - 8);
        document.getElementById("btn-capa-descer").onclick = () => atualizarPos(posY + 8);

        let arrastando = false, startY = 0, startPos = posY;
        boxPrev.style.cursor = "ns-resize";
        boxPrev.title = "Arraste para cima ou para baixo para reposicionar";
        boxPrev.onmousedown = (ev) => { arrastando = true; startY = ev.clientY; startPos = posY; };
        window.addEventListener("mousemove", (ev) => {
          if (!arrastando) return;
          const delta = (startY - ev.clientY) * 0.4;
          atualizarPos(startPos + delta);
        });
        window.addEventListener("mouseup", () => { arrastando = false; });

      }

      document.getElementById("salvar-modal-crop").onclick = function() {
        const legenda = document.getElementById("legenda-nova-foto").value.trim();
        const all = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
        const extra = all[email] || { capa: "", avatar: "", bio: "Cubista apaixonado por speedcubing!", cidade: "Campo Grande, MS", amigos: [], wcaData: null };

        extra[tipo] = imgData;
        if (isCapa) {
          extra.capaPosY = posY;
          extra.albumCapa = extra.albumCapa || [];
          extra.albumCapa.unshift({ img: imgData, data: new Date().toLocaleDateString("pt-BR"), legenda });
        } else {
          extra.albumPerfil = extra.albumPerfil || [];
          extra.albumPerfil.unshift({ img: imgData, data: new Date().toLocaleDateString("pt-BR"), legenda });
        }
        all[email] = extra;
        localStorage.setItem("cms_perfis_v1", JSON.stringify(all));

        if (typeof postsCubistas !== "undefined") {
          const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson" };
          const acaoTxt = isCapa ? "atualizou a foto da capa." : "atualizou a foto do perfil.";
          const textoPost = legenda ? `${acaoTxt}\n\n${legenda}` : acaoTxt;
          postsCubistas.unshift({
            id: Date.now(),
            autor: eu.n,
            iniciais: eu.n.slice(0, 2).toUpperCase(),
            data: "Agora mesmo",
            texto: textoPost,
            tempo: "",
            mod: "",
            scramble: "",
            midia: imgData,
            tipoMidia: "imagem",
            album: isCapa ? "Fotos da Capa" : "Fotos do Perfil",
            reacoes: { "👍": 0, "❤️": 0, "🔥": 0, "🤯": 0, "👏": 0 },
            minhaReacao: "",
            comentarios: []
          });
          if (typeof salvarFeed === "function") salvarFeed();
          if (typeof renderFeed === "function") renderFeed();
        }

        fechar();
        if (window.renderPerfil) window.renderPerfil();
      };
    };
    reader.readAsDataURL(file);
  };
  window.renderGaleriaComAlbuns = function(extra, fotosDoUsuario) {
    const capaFotos = extra.albumCapa || (extra.capa ? [{ img: extra.capa, data: "Capa atual", legenda: "" }] : []);
    const perfilFotos = extra.albumPerfil || (extra.avatar ? [{ img: extra.avatar, data: "Perfil atual", legenda: "" }] : []);
    const todas = [
      ...capaFotos.map(x => x.img),
      ...perfilFotos.map(x => x.img),
      ...fotosDoUsuario.map(x => x.midia)
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    const renderGrade = (imgs) => imgs.length
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:10px;margin-top:10px;">
          ${imgs.map(src => `<img src="${src}" onclick="window.abrirFotoFacebook(this.src)" style="width:100%;height:180px;object-fit:cover;border-radius:8px;border:1px solid #e4e6eb;cursor:pointer;">`).join("")}
        </div>`
      : `<p style="color:#65676b;font-size:13px;margin:8px 0 0;">Nenhuma foto neste álbum ainda.</p>`;

    return `
      <div class="social-card">
        <h3 style="margin:0 0 14px;font-size:20px;font-weight:800;">Fotos & Álbuns</h3>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:24px;">
          <div style="border:1px solid #e4e6eb;border-radius:10px;overflow:hidden;background:#f8f9fa;">
            <div style="height:140px;background:#e4e6eb;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${capaFotos[0] ? `<img src="${capaFotos[0].img}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:32px;">🖼️</span>`}
            </div>
            <div style="padding:10px;">
              <div style="font-weight:700;font-size:15px;">Fotos da Capa</div>
              <div style="font-size:12px;color:#65676b;">${capaFotos.length} ${capaFotos.length === 1 ? "item" : "itens"}</div>
            </div>
          </div>

          <div style="border:1px solid #e4e6eb;border-radius:10px;overflow:hidden;background:#f8f9fa;">
            <div style="height:140px;background:#e4e6eb;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${perfilFotos[0] ? `<img src="${perfilFotos[0].img}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:32px;">👤</span>`}
            </div>
            <div style="padding:10px;">
              <div style="font-weight:700;font-size:15px;">Fotos do Perfil</div>
              <div style="font-size:12px;color:#65676b;">${perfilFotos.length} ${perfilFotos.length === 1 ? "item" : "itens"}</div>
            </div>
          </div>

          <div style="border:1px solid #e4e6eb;border-radius:10px;overflow:hidden;background:#f8f9fa;">
            <div style="height:140px;background:#e4e6eb;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${fotosDoUsuario[0] ? `<img src="${fotosDoUsuario[0].midia}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:32px;">🧊</span>`}
            </div>
            <div style="padding:10px;">
              <div style="font-weight:700;font-size:15px;">Publicações & Solves</div>
              <div style="font-size:12px;color:#65676b;">${fotosDoUsuario.length} ${fotosDoUsuario.length === 1 ? "item" : "itens"}</div>
            </div>
          </div>
        </div>

        <h4 style="margin:0 0 6px;font-size:16px;color:#050505;">Todas as Fotos (${todas.length})</h4>
        ${renderGrade(todas)}
      </div>
    `;
  };
})();
