window.renderColunaEsquerdaPerfil = function(alvo, extra, isMe, fotosDoUsuario) {
  const recs = extra.wcaData?.recordes || {};
  const nomes = {"333":"3x3x3","222":"2x2x2","444":"4x4x4","555":"5x5x5","666":"6x6x6","777":"7x7x7","333bf":"3x3 BLD","333fm":"FMC","333oh":"3x3 OH","clock":"Clock","minx":"Megaminx","pyram":"Pyraminx","skewb":"Skewb","sq1":"Square-1","444bf":"4x4 BLD","555bf":"5x5 BLD","333mbf":"Multi-BLD"};
  const fmt = (cs) => !cs || cs <= 0 ? "-" : (cs/100 < 60 ? (cs/100).toFixed(2)+"s" : Math.floor(cs/6000)+":"+((cs/100)%60).toFixed(2).padStart(5,"0"));
  const cards = Object.keys(recs).filter(ev => recs[ev]?.single).map(ev => `
    <div style="background:#f0f2f5;border:1px solid #dddfe2;border-radius:8px;padding:8px;text-align:center;">
      <div style="font-size:11px;font-weight:800;color:#65676b;">${nomes[ev] || ev.toUpperCase()}</div>
      <div style="font-size:17px;font-weight:900;color:#1877f2;">${fmt(recs[ev].single.best)}</div>
      <div style="font-size:10px;color:#002454;font-weight:700;">SINGLE • BR #${recs[ev].single.national_rank || "-"}</div>
    </div>`).join("");

  const form = (isMe && extra.editandoBio) ? `
    <div style="background:#f0f2f5;padding:10px;border-radius:8px;margin-top:10px;display:flex;flex-direction:column;gap:6px;">
      <textarea id="edit-bio" rows="2" placeholder="Bio cubista..." style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">${extra.bio || ""}</textarea>
      <input id="edit-cubo" value="${extra.cuboMain || ""}" placeholder="🧊 Cubo Principal (ex: GAN 14)" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
      <input id="edit-trabalho" value="${extra.trabalho || ""}" placeholder="💼 Trabalho / Equipe" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
      <input id="edit-estudo" value="${extra.estudo || ""}" placeholder="🎓 Escola / Faculdade" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
      <input id="edit-cidade" value="${extra.cidade || ""}" placeholder="🏠 Mora em..." style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
      <input id="edit-origem" value="${extra.origem || ""}" placeholder="📍 De onde é..." style="width:100%;padding:7px;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">
      <button onclick="window.salvarDetalhesApresentacao('${alvo.e}')" style="padding:8px;border:none;border-radius:6px;background:#1877f2;color:#fff;font-weight:700;cursor:pointer;">Salvar Detalhes</button>
    </div>` : "";

  return `
    <div class="social-card">
      <h3 style="margin:0 0 8px;font-size:20px;font-weight:800;">Apresentação</h3>
      <p style="margin:0 0 10px;font-size:14px;text-align:center;">${extra.bio || ""}</p>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;border-top:1px solid #e4e6eb;padding-top:10px;">
        ${extra.cuboMain ? `<div>🧊 Cubo principal: <strong>${extra.cuboMain}</strong></div>` : ""}
        ${extra.trabalho ? `<div>💼 Trabalha em <strong>${extra.trabalho}</strong></div>` : ""}
        ${extra.estudo ? `<div>🎓 Estudou em <strong>${extra.estudo}</strong></div>` : ""}
        ${extra.cidade ? `<div>🏠 Mora em <strong>${extra.cidade}</strong></div>` : ""}
        ${extra.origem ? `<div>📍 De <strong>${extra.origem}</strong></div>` : ""}
        ${extra.wcaData ? `<div>🏅 WCA ID: <strong>${extra.wcaData.id}</strong> (${extra.wcaData.competicoes} comps)</div>` : ""}
      </div>
      ${isMe ? `<button onclick="window.abrirEditorApresentacao('${alvo.e}')" style="width:100%;margin-top:12px;padding:8px;background:#e4e6eb;border:none;border-radius:6px;font-weight:600;cursor:pointer;">✏️ Editar detalhes</button>` : ""}
      ${form}
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e4e6eb;">
        <strong style="font-size:15px;display:block;margin-bottom:8px;">⭐ Em Destaque (Singles WCA)</strong>
        ${cards ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">${cards}</div>` : `<div style="font-size:12px;color:#65676b;background:#f0f2f5;padding:8px;border-radius:6px;text-align:center;">Vincule seu WCA ID na aba Sobre para mostrar seus Singles aqui.</div>`}
      </div>
    </div>`;
};
