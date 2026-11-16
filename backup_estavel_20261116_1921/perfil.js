(function() {
  const API_WCA = "/api/wca/";

  function getPerfilExtra(email) {
    const all = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    return all[email] || { capa: "", avatar: "", bio: "Cubista apaixonado por speedcubing!", cidade: "Campo Grande, MS", amigos: [], wcaData: null };
  }

  function savePerfilExtra(email, data) {
    const all = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    all[email] = data;
    localStorage.setItem("cms_perfis_v1", JSON.stringify(all));
  }

  window.getUsuarioAtualCMS = function() {
    const s = JSON.parse(localStorage.getItem("cms_s") || "null");
    if (s && s.e) return s;
    return { n: "Jefferson", e: "jefferson@cubomagicoms.com.br", w: "" };
  };

  function getTodosCubistas() {
    const cadastrados = JSON.parse(localStorage.getItem("cms_u") || "[]");
    const base = [];
    const mapa = new Map();
    [...base, ...cadastrados].forEach(u => { if (u && u.e) mapa.set(u.e, u); });
    const atual = window.getUsuarioAtualCMS();
    if (atual && atual.e && !mapa.has(atual.e)) mapa.set(atual.e, atual);
    return Array.from(mapa.values());
  }

  let perfilVisualizadoEmail = window.getUsuarioAtualCMS().e;
  let subAbaPerfil = "publicacoes";
  const mainContainer = document.querySelector("main.container");
  if (!mainContainer) return;

  const viewsDiv = document.createElement("div");
  viewsDiv.innerHTML = `
    <div id="tab-perfil" class="tab-view" style="display: none;">
      <div id="perfil-render-area"></div>
    </div>
    <div id="tab-amigos" class="tab-view" style="display: none;">
      <div class="card-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div>
            <h2 style="margin:0;font-size:20px;color:#050505;">Cubistas & Amigos</h2>
            <p style="margin:4px 0 0;color:#65676b;font-size:14px;">Encontre competidores, visite perfis e adicione amigos da comunidade.</p>
          </div>
          <input id="busca-amigos-input" type="text" placeholder="Filtrar por nome ou WCA ID..." style="background:#f0f2f5;border:none;border-radius:20px;padding:10px 16px;font-size:14px;width:260px;outline:none;" oninput="window.renderListaAmigos()">
        </div>
        <div id="grid-encontrar-amigos" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;"></div>
      </div>
    </div>
  `;
  mainContainer.appendChild(viewsDiv);

  const navTabs = document.querySelector(".tabs");
  if (navTabs && !document.querySelector('[data-tab="tab-amigos"]')) {
    const btnAmigos = document.createElement("button");
    btnAmigos.className = "tab-btn";
    btnAmigos.setAttribute("data-tab", "tab-amigos");
    btnAmigos.title = "Amigos e Cubistas";
    btnAmigos.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
    navTabs.appendChild(btnAmigos);
  }

  const navRight = document.querySelector(".fb-nav-right");
  if (navRight && !document.getElementById("btn-topo-meu-perfil")) {
    const eu = window.getUsuarioAtualCMS();
    const iniciais = eu.n.split(" ").map(x => x).join("").slice(0, 2).toUpperCase();
    const btnMeuPerfil = document.createElement("button");
    btnMeuPerfil.id = "btn-topo-meu-perfil";
    btnMeuPerfil.className = "fb-circle-btn";
    btnMeuPerfil.title = "Meu Perfil";
    const extraEu = getPerfilExtra(eu.e);
    if (extraEu.avatar) {
      btnMeuPerfil.style.cssText = "padding:0;overflow:hidden;border:2px solid #1877f2;";
      btnMeuPerfil.innerHTML = `<img src="${extraEu.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      btnMeuPerfil.style.cssText = "background:#1877f2;color:#fff;font-weight:bold;font-size:13px;";
      btnMeuPerfil.textContent = iniciais;
    }
    btnMeuPerfil.onclick = () => window.abrirPerfilCubista(window.getUsuarioAtualCMS().e);
    navRight.appendChild(btnMeuPerfil);
  }

  const topSearchInput = document.querySelector(".fb-search-box input");
  if (topSearchInput) {
    topSearchInput.placeholder = "Pesquisar cubistas ou WCA ID...";
    topSearchInput.addEventListener("input", (e) => {
      const btnAm = document.querySelector('[data-tab="tab-amigos"]');
      if (btnAm) btnAm.click();
      const filtro = document.getElementById("busca-amigos-input");
      if (filtro) {
        filtro.value = e.target.value;
        window.renderListaAmigos();
      }
    });
  }
  document.querySelectorAll(".fb-left .fb-side-card > div:first-child").forEach(el => {
    el.style.cursor = "pointer";
    el.title = "Abrir meu perfil";
    el.onclick = () => window.abrirPerfilCubista(window.getUsuarioAtualCMS().e);
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    const target = btn.getAttribute("data-tab");
    if (!target) return;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
    const view = document.getElementById(target);
    if (view) view.style.display = "block";
    if (target === "tab-amigos") window.renderListaAmigos();
    if (target === "tab-perfil") window.renderPerfil();
  });

  window.sincronizarWCA = async function(email, wcaIdInput) {
    const wcaId = (wcaIdInput || "").trim().toUpperCase();
    if (!wcaId) return alert("Digite um WCA ID válido (ex: 2024ALME13).");
    const statusEl = document.getElementById("wca-sync-status");
    if (statusEl) statusEl.textContent = "⏳ Buscando dados oficiais na WCA...";

    try {
      const baseApi = "https:" + "//www.worldcubeassociation." + "org/api/v0";
      const resp = await fetch(`${baseApi}/persons/${encodeURIComponent(wcaId)}`);
      if (!resp.ok) throw new Error("Atleta não encontrado na base oficial.");
      const data = await resp.json();
      const p = data.person;

      const atual = window.getUsuarioAtualCMS();
      if (atual.e === email) {
        atual.w = wcaId;
        localStorage.setItem("cms_s", JSON.stringify(atual));
      }
      const listaU = JSON.parse(localStorage.getItem("cms_u") || "[]");
      const idx = listaU.findIndex(x => x.e === email);
      if (idx >= 0) { listaU[idx].w = wcaId; localStorage.setItem("cms_u", JSON.stringify(listaU)); }

      const extra = getPerfilExtra(email);
      extra.wcaData = {
        id: p.wca_id,
        nome: p.name,
        pais: p.country_iso2,
        competicoes: data.competition_count || 0,
        medalhas: data.medals || { gold: 0, silver: 0, bronze: 0 },
        recordes: data.personal_records || {}
      };
      savePerfilExtra(email, extra);

      if (statusEl) statusEl.textContent = "✅ Dados oficiais sincronizados!";
      window.renderPerfil();
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ " + err.message;
      alert("Erro ao consultar WCA: " + err.message);
    }
  };

  window.salvarDetalhesApresentacao = function(email) {
    const extra = getPerfilExtra(email);
    const bioEl = document.getElementById("edit-bio");
    if (bioEl) extra.bio = bioEl.value.trim();
    extra.cidade = document.getElementById("edit-cidade")?.value.trim() || "";
    extra.origem = document.getElementById("edit-origem")?.value.trim() || "";
    extra.trabalho = document.getElementById("edit-trabalho")?.value.trim() || "";
    extra.estudo = document.getElementById("edit-estudo")?.value.trim() || "";
    extra.cuboMain = document.getElementById("edit-cubo")?.value.trim() || "";
    extra.nascimento = document.getElementById("edit-nascimento")?.value || "";
    extra.inicio = document.getElementById("edit-inicio")?.value.trim() || "";
    extra.clube = document.getElementById("edit-clube")?.value.trim() || "";
    extra.visibilidade = {
      cubo: document.getElementById("vis-cubo")?.checked ?? true,
      trabalho: document.getElementById("vis-trabalho")?.checked ?? true,
      estudo: document.getElementById("vis-estudo")?.checked ?? true,
      cidade: document.getElementById("vis-cidade")?.checked ?? true,
      origem: document.getElementById("vis-origem")?.checked ?? true,
      idade: document.getElementById("vis-idade")?.checked ?? true,
      inicio: document.getElementById("vis-inicio")?.checked ?? true,
      clube: document.getElementById("vis-clube")?.checked ?? true
    };
    extra.editandoBio = false;
    savePerfilExtra(email, extra);
    window.renderPerfil();
  };

  window.abrirEditorApresentacao = function(email) {
    const extra = getPerfilExtra(email);
    extra.editandoBio = true;
    savePerfilExtra(email, extra);
    window.renderPerfil();
  };

  window.fecharEditorApresentacao = function(email) {
    const extra = getPerfilExtra(email);
    extra.editandoBio = false;
    savePerfilExtra(email, extra);
    window.renderPerfil();
  };

  window.uploadImagemPerfil = function(input, tipo, email) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const extra = getPerfilExtra(email);
      extra[tipo] = e.target.result;
      savePerfilExtra(email, extra);
      window.renderPerfil();
      if (typeof renderFeed === "function") renderFeed();
      if (window.aplicarFotoPerfilGlobal) window.aplicarFotoPerfilGlobal();
    };
    reader.readAsDataURL(file);
  };

  window.alternarAmizade = function(emailAlvo) {
    const eu = window.getUsuarioAtualCMS();
    if (eu.e === emailAlvo) return;
    const meuExtra = getPerfilExtra(eu.e);
    if (!meuExtra.amigos) meuExtra.amigos = [];
    const pos = meuExtra.amigos.indexOf(emailAlvo);
    if (pos >= 0) meuExtra.amigos.splice(pos, 1);
    else meuExtra.amigos.push(emailAlvo);
    savePerfilExtra(eu.e, meuExtra);
    window.renderPerfil();
    window.renderListaAmigos();
  };

  window.abrirPerfilCubista = function(email) {
    perfilVisualizadoEmail = email;
    subAbaPerfil = "publicacoes";
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
    const tabP = document.getElementById("tab-perfil");
    if (tabP) tabP.style.display = "block";
    window.renderPerfil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.mudarSubAbaPerfil = function(aba) {
    subAbaPerfil = aba;
    window.renderPerfil();
  };
  function formatarCentissegundos(cs) {
    if (!cs || cs <= 0) return "-";
    const totalSec = cs / 100;
    if (totalSec < 60) return totalSec.toFixed(2) + "s";
    const mins = Math.floor(totalSec / 60);
    const secs = (totalSec % 60).toFixed(2).padStart(5, "0");
    return `${mins}:${secs}`;
  }

  window.renderListaAmigos = function() {
    const grid = document.getElementById("grid-encontrar-amigos");
    if (!grid) return;
    const termo = (document.getElementById("busca-amigos-input")?.value || "").toLowerCase();
    const eu = window.getUsuarioAtualCMS();
    const meuExtra = getPerfilExtra(eu.e);
    const cubistas = getTodosCubistas().filter(c =>
      c.n.toLowerCase().includes(termo) || (c.w && c.w.toLowerCase().includes(termo))
    );

    grid.innerHTML = cubistas.map(c => {
      const ex = getPerfilExtra(c.e);
      const isMe = c.e === eu.e;
      const isFriend = (meuExtra.amigos || []).includes(c.e);
      const iniciais = c.n.split(" ").map(x => x).join("").slice(0, 2).toUpperCase();
      const avatarHtml = ex.avatar
        ? `<img src="${ex.avatar}" style="width:100%;height:180px;object-fit:cover;display:block;">`
        : `<div style="width:100%;height:180px;background:linear-gradient(135deg,#1877f2,#002454);color:#fff;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;">${iniciais}</div>`;

      return `
        <div style="background:#fff;border:1px solid #dddfe2;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.08);display:flex;flex-direction:column;">
          <div style="cursor:pointer;" onclick="window.abrirPerfilCubista('${c.e}')">${avatarHtml}</div>
          <div style="padding:12px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div onclick="window.abrirPerfilCubista('${c.e}')" style="font-weight:700;font-size:16px;color:#050505;cursor:pointer;">${c.n}</div>
              <div style="font-size:12px;color:#65676b;margin:4px 0 10px;">${c.w ? "🏅 WCA: " + c.w : "Cubista da Comunidade"}</div>
            </div>
            ${isMe
              ? `<button onclick="window.abrirPerfilCubista('${c.e}')" style="width:100%;padding:8px;background:#e4e6eb;color:#050505;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Ver meu perfil</button>`
              : `<button onclick="window.alternarAmizade('${c.e}')" style="width:100%;padding:8px;background:${isFriend ? "#e7f3ff" : "#1877f2"};color:${isFriend ? "#1877f2" : "#fff"};border:none;border-radius:6px;font-weight:600;cursor:pointer;">${isFriend ? "✓ Amigos" : "+ Adicionar amigo"}</button>`
            }
          </div>
        </div>
      `;
    }).join("");
  };

  window.renderPerfil = function() {
    const area = document.getElementById("perfil-render-area");
    if (!area) return;
    const eu = window.getUsuarioAtualCMS();
    const todos = getTodosCubistas();
    const alvo = todos.find(x => x.e === perfilVisualizadoEmail) || eu;
    const extra = getPerfilExtra(alvo.e);
    const meuExtra = getPerfilExtra(eu.e);
    const isMe = alvo.e === eu.e;
    const isFriend = (meuExtra.amigos || []).includes(alvo.e);
    const iniciais = alvo.n.split(" ").map(x => x).join("").slice(0, 2).toUpperCase();

    const todosPosts = typeof postsCubistas !== "undefined" ? postsCubistas : JSON.parse(localStorage.getItem("cms_feed_v2") || "[]");
    const postsDoUsuario = todosPosts.filter(p => p.autor && alvo.n && p.autor.toLowerCase().includes(alvo.n.split(" ")[0].toLowerCase()));
    const fotosDoUsuario = postsDoUsuario.filter(p => p.midia && p.tipoMidia === "imagem");
    const videosDoUsuario = postsDoUsuario.filter(p => p.midia && (p.tipoMidia === "video" || p.tipoMidia === "youtube"));

    const capaStyle = extra.capa
      ? `background-image:url('${extra.capa}');background-size:cover;background-position:center ${extra.capaPosY ?? 50}%;`
      : `background:linear-gradient(135deg, #1877f2 0%, #002454 100%);`;

    const avatarHtml = extra.avatar
      ? `<img src="${extra.avatar}" style="width:168px;height:168px;border-radius:50%;object-fit:cover;border:4px solid #fff;background:#fff;">`
      : `<div style="width:168px;height:168px;border-radius:50%;background:#002454;color:#fff;font-size:52px;font-weight:900;display:flex;align-items:center;justify-content:center;border:4px solid #fff;">${iniciais}</div>`;

    let conteudoSubAba = "";

    if (subAbaPerfil === "publicacoes") {
      const wcaResumo = extra.wcaData ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e4e6eb;font-size:13px;">
          <div>🏅 <strong>WCA ID:</strong> ${extra.wcaData.id} (${extra.wcaData.pais})</div>
          <div style="margin-top:4px;">🏆 <strong>Competições:</strong> ${extra.wcaData.competicoes}</div>
          <div style="margin-top:4px;">🥇 ${extra.wcaData.medalhas.gold} • 🥈 ${extra.wcaData.medalhas.silver} • 🥉 ${extra.wcaData.medalhas.bronze}</div>
        </div>` : "";

      const postsHtml = window.renderPostsDoPerfil ? window.renderPostsDoPerfil(postsDoUsuario, iniciais) : "";

      conteudoSubAba = `
        <div style="display:grid;grid-template-columns:380px 1fr;gap:16px;">
          <div style="position:sticky;bottom:16px;align-self:end;">${window.renderColunaEsquerdaPerfil ? window.renderColunaEsquerdaPerfil(alvo, extra, isMe, fotosDoUsuario) : ""}</div>
          <div>${postsHtml}</div>
        </div>
      `;
    }
    else if (subAbaPerfil === "sobre") {
      const recs = extra.wcaData?.recordes || {};
      const linhasWca = Object.keys(recs).map(ev => `
        <tr style="border-bottom:1px solid #e4e6eb;">
          <td style="padding:10px;font-weight:700;text-transform:uppercase;">${ev}</td>
          <td style="padding:10px;color:#1877f2;font-weight:700;">${formatarCentissegundos(recs[ev]?.single?.best)}</td>
          <td style="padding:10px;">#${recs[ev]?.single?.national_rank || "-"}</td>
          <td style="padding:10px;color:#002454;font-weight:700;">${formatarCentissegundos(recs[ev]?.average?.best)}</td>
          <td style="padding:10px;">#${recs[ev]?.average?.national_rank || "-"}</td>
        </tr>
      `).join("");

      const idadeSobre = window.calcularIdadeCubista ? window.calcularIdadeCubista(extra.nascimento) : null;
      const dataBr = extra.nascimento ? extra.nascimento.split("-").reverse().join("/") : "";
      conteudoSubAba = `
        <div class="social-card" style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;font-size:18px;">Sobre ${alvo.n}</h3>
            ${isMe ? `<button onclick="window.abrirEditorApresentacao('${alvo.e}')" style="padding:6px 12px;border:none;border-radius:6px;background:#e4e6eb;font-weight:700;cursor:pointer;font-size:13px;">✏️ Editar detalhes</button>` : ""}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;font-size:14px;color:#1c1e21;">
            <div>🧊 <strong>Cubo principal:</strong> ${extra.cuboMain || "Não informado"}</div>
            <div>💼 <strong>Cargo / Trabalho:</strong> ${extra.trabalho || "Não informado"}</div>
            <div>🏆 <strong>Clube / Equipe:</strong> ${extra.clube || "Não informado"}</div>
            <div>🎓 <strong>Formação:</strong> ${extra.estudo || "Não informado"}</div>
            <div>🏠 <strong>Mora em:</strong> ${extra.cidade || "Não informado"}</div>
            <div>📍 <strong>Cidade natal:</strong> ${extra.origem || "Não informado"}</div>
            <div>🎂 <strong>Idade / Nascimento:</strong> ${idadeSobre !== null ? `${idadeSobre} anos (${dataBr})` : "Não informado"}</div>
            <div>⏱️ <strong>Cubista desde:</strong> ${extra.inicio || "Não informado"}</div>
          </div>
          ${isMe ? (window.renderColunaEsquerdaPerfil ? "" : "") : ""}
        </div>
        <div class="social-card">
          <h3 style="margin:0 0 12px;font-size:18px;">Dados Oficiais WCA & Cadastro</h3>
          ${isMe ? `
            <div style="background:#f0f2f5;padding:14px;border-radius:8px;margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <input id="inp-wca-sync" value="${alvo.w || ""}" placeholder="Digite seu WCA ID (ex: 2012PONC02)" style="padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:14px;width:240px;">
              <button onclick="window.sincronizarWCA('${alvo.e}', document.getElementById('inp-wca-sync').value)" class="btn-social-red">🔄 Puxar Dados Oficiais da API WCA</button>
              <span id="wca-sync-status" style="font-size:13px;font-weight:600;color:#1877f2;"></span>
            </div>
          ` : ""}
          ${extra.wcaData ? `
            <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;background:#f8f9fa;padding:14px;border-radius:8px;">
              <div><strong>Nome Oficial WCA:</strong> ${extra.wcaData.nome}</div>
              <div><strong>WCA ID:</strong> ${extra.wcaData.id}</div>
              <div><strong>País:</strong> ${extra.wcaData.pais}</div>
              <div><strong>Competições:</strong> ${extra.wcaData.competicoes}</div>
              <div><strong>Medalhas:</strong> 🥇 ${extra.wcaData.medalhas.gold} | 🥈 ${extra.wcaData.medalhas.silver} | 🥉 ${extra.wcaData.medalhas.bronze}</div>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left;">
              <thead>
                <tr style="background:#f0f2f5;">
                  <th style="padding:10px;">Modalidade</th>
                  <th style="padding:10px;">Single PB</th>
                  <th style="padding:10px;">Rank Nac.</th>
                  <th style="padding:10px;">Average PB</th>
                  <th style="padding:10px;">Rank Nac.</th>
                </tr>
              </thead>
              <tbody>${linhasWca}</tbody>
            </table>
          ` : `<p style="color:#65676b;">Nenhum WCA ID sincronizado neste perfil ainda. ${isMe ? "Informe seu WCA ID acima para importar seus recordes oficiais!" : ""}</p>`}
        </div>
      `;
    } else if (subAbaPerfil === "amigos") {
      const listaIds = extra.amigos || [];
      const amigosObjs = todos.filter(u => listaIds.includes(u.e));
      conteudoSubAba = `
        <div class="social-card">
          <h3 style="margin:0 0 14px;font-size:18px;">Amigos (${amigosObjs.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:12px;">
            ${amigosObjs.map(am => `
              <div onclick="window.abrirPerfilCubista('${am.e}')" style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid #e4e6eb;border-radius:8px;cursor:pointer;">
                <div style="width:54px;height:54px;border-radius:8px;background:#1877f2;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;">${am.n.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style="font-weight:700;font-size:15px;">${am.n}</div>
                  <div style="font-size:12px;color:#65676b;">${am.w || "Comunidade MS"}</div>
                </div>
              </div>
            `).join("") || `<p style="color:#65676b;">Nenhum amigo adicionado ainda. Clique no ícone de Amigos na barra superior para encontrar cubistas!</p>`}
          </div>
        </div>
      `;
    } else if (subAbaPerfil === "fotos") {
      conteudoSubAba = window.renderGaleriaComAlbuns ? window.renderGaleriaComAlbuns(extra, fotosDoUsuario) : "";
    } else if (subAbaPerfil === "videos") {
      conteudoSubAba = `
        <div class="social-card">
          <h3 style="margin:0 0 14px;font-size:18px;">Vídeos de Solves (${videosDoUsuario.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:14px;">
            ${videosDoUsuario.map(v => v.tipoMidia === "video"
              ? `<video src="${v.midia}" controls style="width:100%;border-radius:8px;background:#000;"></video>`
              : `<a href="${v.midia}" target="_blank" style="display:block;padding:20px;background:#f0f2f5;border-radius:8px;font-weight:700;color:#1877f2;">▶️ Assistir Vídeo Externo</a>`
            ).join("") || `<p style="color:#65676b;">Nenhum vídeo publicado ainda.</p>`}
          </div>
        </div>
      `;
    }
    area.innerHTML = `
      <div style="background:#fff;border-radius:0 0 8px 8px;box-shadow:0 1px 2px rgba(0,0,0,0.1);margin:-16px -16px 16px -16px;overflow:hidden;">
        <div style="max-width:1080px;margin:0 auto;">
          <div onclick="if(event.target===this && '${extra.capa || ""}' && window.abrirFotoFacebook) window.abrirFotoFacebook('${extra.capa || ""}')" title="Clique para ver a foto da capa" style="height:290px;${capaStyle}border-radius:0 0 8px 8px;position:relative;cursor:${extra.capa ? "pointer" : "default"};">
            ${isMe ? `
              <label style="position:absolute;bottom:14px;right:16px;background:#fff;color:#050505;padding:8px 14px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                📷 Editar foto da capa
                <input type="file" accept="image/*" style="display:none;" onchange="window.abrirModalFotoPerfilCapa(this, 'capa', '${alvo.e}')">
              </label>
            ` : ""}
          </div>

          <div style="padding:0 24px 16px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;margin-top:-36px;position:relative;">
            <div style="display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap;">
              <div style="position:relative;">
                ${avatarHtml}
                ${isMe ? `
                  <label title="Trocar foto de perfil" style="position:absolute;bottom:8px;right:8px;width:36px;height:36px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #fff;">
                    📷
                    <input type="file" accept="image/*" style="display:none;" onchange="window.abrirModalFotoPerfilCapa(this, 'avatar', '${alvo.e}')">
                  </label>
                ` : ""}
              </div>
              <div style="padding-bottom:8px;">
                <h1 style="margin:0;font-size:28px;font-weight:800;color:#050505;">${alvo.n}</h1>
                <div style="color:#65676b;font-weight:600;font-size:15px;margin-top:2px;">
                  ${(extra.amigos || []).length} amigos ${alvo.w ? `• 🏅 WCA ID: ${alvo.w}` : ""}
                </div>
              </div>
            </div>

            <div style="padding-bottom:8px;display:flex;gap:8px;">
              ${isMe
                ? `<button onclick="window.mudarSubAbaPerfil('sobre')" style="background:#1877f2;color:#fff;border:none;padding:9px 16px;border-radius:6px;font-weight:600;cursor:pointer;">🏅 Vincular / Atualizar WCA ID</button>`
                : `<button onclick="window.alternarAmizade('${alvo.e}')" style="background:${isFriend ? "#e4e6eb" : "#1877f2"};color:${isFriend ? "#050505" : "#fff"};border:none;padding:9px 18px;border-radius:6px;font-weight:600;cursor:pointer;">${isFriend ? "✓ Amigos" : "+ Adicionar amigo"}</button>`
              }
            </div>
          </div>

          <div style="border-top:1px solid #e4e6eb;padding:0 24px;display:flex;gap:6px;overflow-x:auto;">
            ${[
              ["publicacoes", "Publicações"],
              ["sobre", "Sobre & WCA Oficial"],
              ["amigos", "Amigos"],
              ["fotos", "Fotos"],
              ["videos", "Vídeos"]
            ].map(([id, label]) => `
              <button onclick="window.mudarSubAbaPerfil('${id}')" style="padding:14px 16px;border:none;background:transparent;font-weight:600;font-size:15px;cursor:pointer;color:${subAbaPerfil === id ? "#1877f2" : "#65676b"};border-bottom:3px solid ${subAbaPerfil === id ? "#1877f2" : "transparent"};">
                ${label}
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <div style="max-width:1080px;margin:0 auto;">
        ${conteudoSubAba}
      </div>
    `;
  };

  const oldBtn = document.getElementById("btn-login-cms");
  if (oldBtn) oldBtn.style.display = "none";

  if (!document.getElementById("fb-new-msg-btn")) {
    const msgBtn = document.createElement("button");
    msgBtn.id = "fb-new-msg-btn";
    msgBtn.title = "Nova mensagem";
    msgBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 2.5a2.12 2.12 0 0 1 3 3L8.5 16.75l-4 1 1-4L16.75 2.5zM4 20h16v2H4v-2z"/></svg>`;
    msgBtn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;width:48px;height:48px;border-radius:50%;background:#fff;color:#050505;border:none;box-shadow:0 2px 12px rgba(0,0,0,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.15s;";
    msgBtn.onmouseover = () => msgBtn.style.background = "#f0f2f5";
    msgBtn.onmouseout = () => msgBtn.style.background = "#fff";
    msgBtn.onclick = () => alert("💬 Chat entre cubistas amigos em breve!");
    document.body.appendChild(msgBtn);
  }
})();
