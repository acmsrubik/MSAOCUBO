window.calcularIdadeCubista = function(dataNasc) {
  if (!dataNasc) return null;
  const hoje = new Date();
  const nasc = new Date(dataNasc + "T00:00:00");
  if (isNaN(nasc.getTime())) return null;
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade >= 0 ? idade : null;
};

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

  const vis = extra.visibilidade || {};
  const showCubo = vis.cubo !== false, showTrabalho = vis.trabalho !== false, showEstudo = vis.estudo !== false;
  const showCidade = vis.cidade !== false, showOrigem = vis.origem !== false, showIdade = vis.idade !== false;
  const showInicio = vis.inicio !== false, showClube = vis.clube !== false;
  const idadeCalculada = window.calcularIdadeCubista(extra.nascimento);

  const modal = (isMe && extra.editandoBio) ? `
    <div id="modal-fb-apresentacao" onclick="if(event.target===this) window.fecharEditorApresentacao('${alvo.e}')" style="position:fixed;inset:0;background:rgba(244,244,244,0.82);backdrop-filter:blur(2px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">
      <div style="background:#fff;width:100%;max-width:520px;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,0.22);border:1px solid #dddfe2;overflow:hidden;display:flex;flex-direction:column;max-height:88vh;">
        <div style="padding:14px 18px;border-bottom:1px solid #e4e6eb;display:flex;align-items:center;justify-content:space-between;">
          <h3 style="margin:0;font-size:19px;font-weight:800;color:#050505;">Editar detalhes</h3>
          <button onclick="window.fecharEditorApresentacao('${alvo.e}')" style="width:34px;height:34px;border-radius:50%;border:none;background:#e4e6eb;font-size:16px;font-weight:700;cursor:pointer;color:#606770;">✕</button>
        </div>
        <div style="padding:16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;font-size:14px;">
          <p style="margin:0;color:#65676b;font-size:13px;">Os detalhes marcados ficarão públicos na sua Apresentação.</p>
          <div>
            <label style="font-weight:700;display:block;margin-bottom:5px;">📝 Bio / Apresentação</label>
            <textarea id="edit-bio" rows="2" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;font-family:inherit;">${extra.bio || ""}</textarea>
          </div>
          <div style="border-top:1px solid #e4e6eb;padding-top:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">🧊 Cubo principal</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-cubo" ${showCubo ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-cubo" value="${extra.cuboMain || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">💼 Cargo / Trabalho</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-trabalho" ${showTrabalho ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-trabalho" value="${extra.trabalho || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">🎓 Formação acadêmica</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-estudo" ${showEstudo ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-estudo" value="${extra.estudo || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">🏠 Cidade atual</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-cidade" ${showCidade ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-cidade" value="${extra.cidade || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">📍 Cidade natal (De onde é)</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-origem" ${showOrigem ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-origem" value="${extra.origem || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <label style="font-weight:700;">🎂 Nascimento</label>
                <input type="checkbox" id="vis-idade" title="Exibir idade" ${showIdade ? "checked" : ""}>
              </div>
              <input type="date" id="edit-nascimento" value="${extra.nascimento || ""}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <label style="font-weight:700;">⏱️ Cubista desde</label>
                <input type="checkbox" id="vis-inicio" title="Exibir ano" ${showInicio ? "checked" : ""}>
              </div>
              <input type="number" id="edit-inicio" value="${extra.inicio || ""}" placeholder="" min="1980" max="2030" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <label style="font-weight:700;">🏆 Clube / Equipe</label>
              <label style="font-size:12px;color:#65676b;cursor:pointer;"><input type="checkbox" id="vis-clube" ${showClube ? "checked" : ""}> Exibir</label>
            </div>
            <input id="edit-clube" value="${extra.clube || ""}" placeholder="" style="width:100%;padding:9px;border-radius:8px;border:1px solid #ccd0d5;box-sizing:border-box;">
          </div>
        </div>
        <div style="padding:12px 18px;border-top:1px solid #e4e6eb;display:flex;justify-content:flex-end;gap:10px;background:#f7f8fa;">
          <button onclick="window.fecharEditorApresentacao('${alvo.e}')" style="padding:8px 16px;border:none;border-radius:6px;background:#e4e6eb;color:#050505;font-weight:700;cursor:pointer;">Cancelar</button>
          <button onclick="window.salvarDetalhesApresentacao('${alvo.e}')" style="padding:8px 20px;border:none;border-radius:6px;background:#1877f2;color:#fff;font-weight:700;cursor:pointer;">Salvar</button>
        </div>
      </div>
    </div>` : "";

  return `
    <div class="social-card">
      <h3 style="margin:0 0 8px;font-size:20px;font-weight:800;">Apresentação</h3>
      <p style="margin:0 0 10px;font-size:14px;text-align:center;color:#1c1e21;">${extra.bio || ""}</p>
      <div style="display:flex;flex-direction:column;gap:9px;font-size:14px;border-top:1px solid #e4e6eb;padding-top:10px;color:#1c1e21;">
        ${(showCubo && extra.cuboMain) ? `<div>🧊 Cubo principal: <strong>${extra.cuboMain}</strong></div>` : ""}
        ${(showTrabalho && extra.trabalho) ? `<div>💼 <strong>${extra.trabalho}</strong></div>` : ""}
        ${(showClube && extra.clube) ? `<div>🏆 Equipe/Clube: <strong>${extra.clube}</strong></div>` : ""}
        ${(showEstudo && extra.estudo) ? `<div>🎓 Estudou em <strong>${extra.estudo}</strong></div>` : ""}
        ${(showCidade && extra.cidade) ? `<div>🏠 Mora em <strong>${extra.cidade}</strong></div>` : ""}
        ${(showOrigem && extra.origem) ? `<div>📍 De <strong>${extra.origem}</strong></div>` : ""}
        ${(showIdade && idadeCalculada !== null) ? `<div>🎂 <strong>${idadeCalculada} anos</strong></div>` : ""}
        ${(showInicio && extra.inicio) ? `<div>⏱️ Cubista desde <strong>${extra.inicio}</strong></div>` : ""}
        ${extra.wcaData ? `<div>🏅 WCA ID: <strong>${extra.wcaData.id}</strong> (${extra.wcaData.competicoes} comps)</div>` : ""}
      </div>
      ${isMe ? `<button onclick="window.abrirEditorApresentacao('${alvo.e}')" style="width:100%;margin-top:12px;padding:8px;background:#e4e6eb;border:none;border-radius:6px;font-weight:700;color:#050505;cursor:pointer;">✏️ Editar detalhes</button>` : ""}
      ${modal}
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e4e6eb;">
        <strong style="font-size:15px;display:block;margin-bottom:8px;">⭐ Em Destaque (Singles WCA)</strong>
        ${cards ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">${cards}</div>` : `<div style="font-size:12px;color:#65676b;background:#f0f2f5;padding:8px;border-radius:6px;text-align:center;">Vincule seu WCA ID na aba Sobre para mostrar seus Singles aqui.</div>`}
      </div>
    </div>`;
};
