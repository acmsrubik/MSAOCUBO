with open("perfil.js", "r", encoding="utf-8") as f:
    code = f.read()

bloco_antigo_inicio = code.index('    if (subAbaPerfil === "publicacoes") {')
bloco_antigo_fim = code.index('    } else if (subAbaPerfil === "sobre") {')

novo_bloco_publicacoes = """    if (subAbaPerfil === "publicacoes") {
      const recs = extra.wcaData?.recordes || {};
      const nomesMod = {
        "333": "3x3x3", "222": "2x2x2", "444": "4x4x4", "555": "5x5x5",
        "666": "6x6x6", "777": "7x7x7", "333bf": "3x3 BLD", "333fm": "FMC",
        "333oh": "3x3 OH", "clock": "Clock", "minx": "Megaminx", "pyram": "Pyraminx",
        "skewb": "Skewb", "sq1": "Square-1", "444bf": "4x4 BLD", "555bf": "5x5 BLD", "333mbf": "Multi-BLD"
      };

      const cardsDestaquesWca = Object.keys(recs).filter(ev => recs[ev]?.single).map(ev => `
        <div style="background:#f0f2f5;border:1px solid #dddfe2;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:11px;font-weight:800;color:#65676b;text-transform:uppercase;">${nomesMod[ev] || ev}</div>
          <div style="font-size:18px;font-weight:900;color:#1877f2;margin:2px 0;">${formatarCentissegundos(recs[ev].single.best)}</div>
          <div style="font-size:10px;color:#002454;font-weight:700;">SINGLE • BR #${recs[ev].single.national_rank || "-"}</div>
        </div>
      `).join("");

      const formEdicao = (isMe && extra.editandoBio) ? `
        <div style="background:#f0f2f5;padding:12px;border-radius:8px;margin-top:10px;display:flex;flex-direction:column;gap:8px;">
          <textarea id="edit-bio" rows="2" placeholder="Escreva sua bio cubista..." style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;font-family:inherit;">${extra.bio || ""}</textarea>
          <input id="edit-cubo" value="${extra.cuboMain || ""}" placeholder="🧊 Cubo Principal (ex: GAN 14 MagLev)" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
          <input id="edit-trabalho" value="${extra.trabalho || ""}" placeholder="💼 Trabalho / Equipe" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
          <input id="edit-estudo" value="${extra.estudo || ""}" placeholder="🎓 Formação / Escola" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
          <input id="edit-cidade" value="${extra.cidade || ""}" placeholder="🏠 Mora em..." style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
          <input id="edit-origem" value="${extra.origem || ""}" placeholder="📍 De onde é..." style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button onclick="window.abrirEditorApresentacao('${alvo.e}')" style="padding:7px 12px;border:none;border-radius:6px;background:#e4e6eb;font-weight:600;cursor:pointer;">Cancelar</button>
            <button onclick="window.salvarDetalhesApresentacao('${alvo.e}')" style="padding:7px 14px;border:none;border-radius:6px;background:#1877f2;color:#fff;font-weight:600;cursor:pointer;">Salvar</button>
          </div>
        </div>
      ` : "";

      const postsHtml = postsDoUsuario.length ? postsDoUsuario.map(p => `
        <div class="social-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#1877f2;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;">${iniciais}</div>
            <div>
              <div style="font-weight:700;font-size:14px;">${p.autor}</div>
              <div style="font-size:12px;color:#65676b;">${p.data}</div>
            </div>
          </div>
          <p style="margin:6px 0;font-size:15px;">${p.texto}</p>
          ${p.tempo ? `<div class="solve-badge">⏱️ <strong>${p.tempo}</strong> (${p.mod})</div>` : ""}
          ${p.midia && p.tipoMidia === "imagem" ? `<img src="${p.midia}" class="post-media">` : ""}
          ${p.midia && p.tipoMidia === "video" ? `<video src="${p.midia}" controls class="post-media"></video>` : ""}
        </div>
      `).join("") : `<div class="social-card" style="text-align:center;color:#65676b;padding:30px;">Nenhuma publicação neste perfil ainda.</div>`;

      conteudoSubAba = `
        <div style="display:grid;grid-template-columns:380px 1fr;gap:16px;align-items:start;">
          <div>
            <div class="social-card">
              <h3 style="margin:0 0 10px;font-size:20px;font-weight:800;">Apresentação</h3>
              <p style="margin:0 0 12px;font-size:15px;text-align:center;color:#050505;">${extra.bio}</p>
              <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;color:#050505;border-top:1px solid #e4e6eb;padding-top:12px;">
                ${extra.cuboMain ? `<div>🧊 Cubo principal: <strong>${extra.cuboMain}</strong></div>` : ""}
                ${extra.trabalho ? `<div>💼 Trabalha em <strong>${extra.trabalho}</strong></div>` : ""}
                ${extra.estudo ? `<div>🎓 Estudou em <strong>${extra.estudo}</strong></div>` : ""}
                ${extra.cidade ? `<div>🏠 Mora em <strong>${extra.cidade}</strong></div>` : ""}
                ${extra.origem ? `<div>📍 De <strong>${extra.origem}</strong></div>` : ""}
                ${extra.wcaData ? `<div>🏅 WCA ID: <strong>${extra.wcaData.id}</strong> (${extra.wcaData.competicoes} competições)</div>` : ""}
              </div>

              ${isMe ? `
                <button onclick="window.abrirEditorApresentacao('${alvo.e}')" style="width:100%;margin-top:14px;padding:8px;background:#e4e6eb;color:#050505;border:none;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;">
                  ✏️ Editar detalhes
                </button>
              ` : ""}
              ${formEdicao}

              <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e4e6eb;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                  <strong style="font-size:15px;color:#050505;">⭐ Em Destaque (Singles WCA)</strong>
                  ${isMe && !extra.wcaData ? `<span onclick="window.mudarSubAbaPerfil('sobre')" style="color:#1877f2;font-size:12px;font-weight:600;cursor:pointer;">Vincular WCA</span>` : ""}
                </div>
                ${cardsDestaquesWca ? `
                  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${cardsDestaquesWca}
                  </div>
                ` : `<div style="font-size:13px;color:#65676b;background:#f0f2f5;padding:10px;border-radius:6px;text-align:center;">Sincronize seu WCA ID na aba <strong>Sobre & WCA Oficial</strong> para exibir seus Singles oficiais aqui em destaque.</div>`}
              </div>
            </div>

            <div class="social-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h3 style="margin:0;font-size:18px;font-weight:800;">Fotos</h3>
                <span onclick="window.mudarSubAbaPerfil('fotos')" style="color:#1877f2;font-size:14px;cursor:pointer;">Ver todas</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;border-radius:8px;overflow:hidden;">
                ${fotosDoUsuario.slice(0, 6).map(f => `<img src="${f.midia}" style="width:100%;height:95px;object-fit:cover;">`).join("") || `<div style="grid-column:span 3;color:#65676b;font-size:13px;">Sem fotos postadas.</div>`}
              </div>
            </div>
          </div>
          <div>${postsHtml}</div>
        </div>
      `;
"""

code = code[:bloco_antigo_inicio] + novo_bloco_publicacoes + code[bloco_antigo_fim:]
with open("perfil.js", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ Parte 2 concluída! API WCA sem CORS, Apresentação editável e Destaques WCA ativados!")
