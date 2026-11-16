const ADMIN_E = "admin@cubomagicoms.com.br";
const ADMIN_P = "cms2026";
const box = document.createElement("div");
box.innerHTML = `
<button id="btn-login-cms" style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#002454;color:#fff;border:2px solid #E30613;padding:12px 18px;border-radius:30px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3)">ENTRAR / CONTA</button>
<div id="mod-cms" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center;padding:15px;font-family:sans-serif">
  <div style="background:#fff;border-radius:8px;max-width:620px;width:100%;padding:22px;border-top:5px solid #002454;max-height:92vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <strong style="color:#002454;font-size:16px">PORTAL CUBO MÁGICO MS</strong>
      <button id="cls-cms" style="border:none;background:none;font-size:20px;cursor:pointer">✕</button>
    </div>
    <div id="view-login">
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <button id="tab-in" style="flex:1;padding:8px;background:#002454;color:#fff;border:none;border-radius:4px;cursor:pointer">ENTRAR</button>
        <button id="tab-up" style="flex:1;padding:8px;background:#eee;color:#002454;border:none;border-radius:4px;cursor:pointer">CRIAR CONTA</button>
      </div>
      <div id="box-up" style="display:none">
        <input id="reg-n" placeholder="Nome completo" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box">
        <input id="reg-w" placeholder="WCA ID (opcional)" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box">
      </div>
      <input id="log-e" placeholder="E-mail" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box">
      <input id="log-p" type="password" placeholder="Senha" style="width:100%;padding:8px;margin-bottom:10px;box-sizing:border-box">
      <button id="btn-go" style="width:100%;padding:10px;background:#E30613;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer">ACESSAR</button>
    </div>
    <div id="view-user" style="display:none"></div>
  </div>
</div>
<div id="mod-read" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:100000;align-items:center;justify-content:center;padding:15px;font-family:sans-serif">
  <div style="background:#fff;border-radius:8px;max-width:740px;width:100%;padding:26px;border-top:6px solid #E30613;max-height:92vh;overflow-y:auto;position:relative">
    <button id="cls-read" style="position:sticky;top:0;float:right;border:none;background:#002454;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;font-weight:bold;cursor:pointer">✕</button>
    <div id="read-body"></div>
  </div>
</div>`;
document.body.appendChild(box);

let isReg = false,
  users = JSON.parse(localStorage.getItem("cms_u") || "[]"),
  user = JSON.parse(localStorage.getItem("cms_s") || "null"),
  news = JSON.parse(localStorage.getItem("cms_n") || "[]"),
  pautas = [],
  fotoBase64 = "";

const mod = document.getElementById("mod-cms"),
  modRead = document.getElementById("mod-read"),
  btn = document.getElementById("btn-login-cms");

btn.onclick = () => openCms();
document.getElementById("cls-cms").onclick = () => (mod.style.display = "none");
document.getElementById("cls-read").onclick = () => (modRead.style.display = "none");
modRead.onclick = (e) => { if (e.target === modRead) modRead.style.display = "none"; };
document.getElementById("tab-in").onclick = () => { isReg = false; document.getElementById("box-up").style.display = "none"; };
document.getElementById("tab-up").onclick = () => { isReg = true; document.getElementById("box-up").style.display = "block"; };

function updateBtn() {
  btn.textContent = user ? "CONTA: " + user.n.split(" ")[0].toUpperCase() : "ENTRAR / CONTA";
  document.querySelectorAll("a,button,span").forEach((el) => {
    if (el.textContent.trim().toUpperCase() === "ÁREA EDITORIAL") {
      el.style.cursor = "pointer";
      el.onclick = (e) => { e.preventDefault(); openCms(); };
    }
  });
}

document.getElementById("btn-go").onclick = () => {
  const e = document.getElementById("log-e").value.trim().toLowerCase(),
    p = document.getElementById("log-p").value;
  if (isReg) {
    const n = document.getElementById("reg-n").value.trim(),
      w = document.getElementById("reg-w").value.trim().toUpperCase();
    if (!n || !e || !p) return alert("Preencha todos os campos.");
    user = { n, w, e, p, r: "user" };
    users.push(user);
    localStorage.setItem("cms_u", JSON.stringify(users));
  } else if (e === ADMIN_E && p === ADMIN_P) {
    user = { n: "Admin CMS", e, r: "admin" };
  } else {
    user = users.find((u) => u.e === e && u.p === p);
    if (!user) return alert("Login inválido.");
  }
  localStorage.setItem("cms_s", JSON.stringify(user));
  updateBtn();
  openCms();
};

function updateCharCount() {
  const txtEl = document.getElementById("n-txt");
  const cntEl = document.getElementById("char-count");
  if (!txtEl || !cntEl) return;
  const len = txtEl.value.trim().length;
  cntEl.textContent = `${len} / 1000 letras mínimas ${len >= 1000 ? "✓" : "(escreva mais detalhes)"}`;
  cntEl.style.color = len >= 1000 ? "#198754" : "#E30613";
}

function openCms() {
  mod.style.display = "flex";
  const vLog = document.getElementById("view-login"),
    vUsr = document.getElementById("view-user");
  if (!user) { vLog.style.display = "block"; vUsr.style.display = "none"; return; }
  vLog.style.display = "none";
  vUsr.style.display = "block";
  if (user.r === "admin") {
    vUsr.innerHTML = `
      <div style="display:flex;justify-content:space-between;background:#f4f6f9;padding:8px 12px;border-radius:4px;margin-bottom:10px">
        <strong style="color:#002454;font-size:13px">EDITOR-CHEFE: ${user.n}</strong>
        <button id="btn-out" style="background:#333;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer">SAIR</button>
      </div>
      <div style="background:#002454;color:#fff;padding:12px;border-radius:6px;margin-bottom:12px">
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <input id="tema-sug" placeholder="Sugira um tema ou título (ex: Inscritos no Cubo de Barro)..." style="flex:1;padding:7px;border:none;border-radius:4px;font-size:12px">
          <button id="btn-ia" style="background:#E30613;color:#fff;border:none;padding:7px 12px;border-radius:4px;font-size:11px;font-weight:bold;cursor:pointer">GERAR PAUTAS (+1000 LETRAS)</button>
        </div>
        <div id="ia-list"></div>
      </div>
      <input id="n-tit" placeholder="Manchete da notícia" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-weight:bold">
      <textarea id="n-txt" rows="7" placeholder="Corpo completo da matéria (mínimo de 1000 letras)..." style="width:100%;padding:8px;margin-bottom:4px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-family:sans-serif;line-height:1.4"></textarea>
      <div id="char-count" style="font-size:11px;font-weight:bold;text-align:right;margin-bottom:8px;color:#E30613">0 / 1000 letras mínimas</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <input type="file" id="n-foto" accept="image/*" style="font-size:12px;flex:1">
        <input id="n-fonte" placeholder="Link da fonte WCA" style="flex:1;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:12px">
        <button id="btn-ver-fonte" style="background:#e9ecef;color:#002454;border:1px solid #ccc;padding:7px 10px;border-radius:4px;font-size:11px;font-weight:bold;cursor:pointer">VERIFICAR FONTE</button>
      </div>
      <div id="foto-preview" style="margin-bottom:8px;display:none"></div>
      <button id="btn-pub" style="width:100%;padding:11px;background:#E30613;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer">✓ PUBLICAR NOTÍCIA COMPLETA</button>`;

    document.getElementById("btn-ia").onclick = genNews;
    document.getElementById("btn-pub").onclick = pubNews;
    document.getElementById("n-txt").oninput = updateCharCount;
    document.getElementById("btn-ver-fonte").onclick = () => {
      const u = document.getElementById("n-fonte").value.trim() || "https://worldcubeassociation.org";
      window.open(u, "_blank");
    };
    document.getElementById("n-foto").onchange = (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 900;
          const scale = img.width > maxW ? maxW / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          fotoBase64 = canvas.toDataURL("image/jpeg", 0.8);
          const prev = document.getElementById("foto-preview");
          prev.style.display = "block";
          prev.innerHTML = `<small style="color:#198754;font-weight:bold">✓ Foto carregada e otimizada:</small><br><img src="${fotoBase64}" style="max-height:110px;border-radius:4px;margin-top:4px;border:1px solid #ccc">`;
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
  } else {
    vUsr.innerHTML = `<p>Bem-vindo, <strong>${user.n}</strong>! Conta ativa para o Fórum.</p><button id="btn-out">SAIR</button>`;
  }
  document.getElementById("btn-out").onclick = () => { user = null; localStorage.removeItem("cms_s"); updateBtn(); openCms(); };
}


async function genNews() {
  const b = document.getElementById("ia-list"), tema = document.getElementById("tema-sug").value.trim();
  b.innerHTML = "<small>Redigindo matérias completas (+1000 letras)...</small>";
  let todas = [];
  try {
    const r = await fetch("competicoes_br.json?t=" + Date.now());
    const raw = await r.json();
    todas = Array.isArray(raw) ? raw : raw.items || raw.competitions || Object.values(raw).flat();
  } catch (e) {}
  const hoje = new Date().toISOString().slice(0, 10);
  const futuras = todas.filter((x) => x && (x.start_date || x.data || "") >= hoje);
  const lista = futuras.length > 0 ? futuras : todas;
  const c1 = lista[0] || null, c2 = lista[1] || lista[0] || null;
  pautas = [];
  const baseTxt = "\n\nDe acordo com o acompanhamento editorial do Portal Cubo Mágico MS, atletas de diferentes faixas etárias estão intensificando suas rotinas diárias com foco em consistência de médias (Ao5 e Mo3), controle de nervosismo sob pressão e domínio de algoritmos avançados. Em eventos homologados pela World Cube Association (WCA), não basta apenas alcançar tempos baixos em casa: o competidor precisa lidar com o ambiente de ginásio, o acionamento preciso do cronômetro Stackmat e o cumprimento rigoroso dos 15 segundos de inspeção.\n\nAlém do aspecto competitivo, a movimentação fortalece o calendário regional e integra novos talentos aos veteranos. A recomendação dos delegados e organizadores é revisar o regulamento oficial, alinhar o cubo dentro do limite de 45 graus ao finalizar cada tentativa e manter o equipamento lubrificado dentro das normas da WCA.";
  if (tema) {
    const tt = tema.charAt(0).toUpperCase() + tema.slice(1);
    pautas.push({ t: `${tt}: Análise completa e impactos para a comunidade do cubo mágico`, x: `A comunidade brasileira de speedcubing volta suas atenções para "${tt}", assunto que vem movimentando grupos de treino e bastidores das competições oficiais no Brasil e em Mato Grosso do Sul.` + baseTxt, f: c1?.id ? `https://worldcubeassociation.org{c1.id}` : "https://worldcubeassociation.org" });
  }
  if (c1) {
    const n1 = c1.name || c1.nome || "Campeonato Oficial WCA", cid1 = c1.city || c1.local || "Mato Grosso do Sul", lim1 = c1.competitor_limit || c1.limite || "40";
    pautas.push({ t: `Speedcubers garantem vaga no ${n1} e aquecem disputa pelo pódio em ${cid1}`, x: `A contagem regressiva já começou para o ${n1}, torneio oficial da WCA em ${cid1} com limite de ${lim1} competidores inscritos buscando novos recordes pessoais (PRs) no 3x3x3 e modalidades extras.` + baseTxt, f: c1.id ? `https://worldcubeassociation.org{c1.id}/registrations` : "https://worldcubeassociation.org" });
  }
  pautas.push({ t: "Guia da Redação: Como transformar tempos de treino em médias oficiais na WCA", x: "Alcançar médias rápidas treinando em casa e repetir o desempenho na mesa oficial da WCA exige controle emocional, aquecimento prévio e domínio total das regras de inspeção e cronometragem." + baseTxt, f: "https://worldcubeassociation.org" });
  b.innerHTML = pautas.map((p, i) => `<div style="background:#fff;color:#222;padding:7px 10px;margin-top:5px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px"><span><strong>${p.t}</strong> <small style="color:#198754">(${p.x.length} letras)</small></span><button onclick="useP(${i})" style="background:#002454;color:#fff;border:none;padding:5px 9px;border-radius:4px;cursor:pointer;font-weight:bold">USAR</button></div>`).join("");
}
window.useP = (i) => { document.getElementById("n-tit").value = pautas[i].t; document.getElementById("n-txt").value = pautas[i].x; document.getElementById("n-fonte").value = pautas[i].f; updateCharCount(); };
function pubNews() {
  const t = document.getElementById("n-tit").value.trim(), x = document.getElementById("n-txt").value.trim(), f = document.getElementById("n-fonte").value.trim();
  if (!t || !x) return alert("Preencha título e texto.");
  if (x.length < 1000) return alert(`Mínimo de 1000 letras. Atual: ${x.length}.`);
  try { news.unshift({ id: Date.now(), d: new Date().toLocaleDateString("pt-BR"), t, x, img: fotoBase64, f }); localStorage.setItem("cms_n", JSON.stringify(news)); } catch (e) { return alert("Foto muito pesada."); }
  fotoBase64 = ""; renderNews(); mod.style.display = "none";
}
window.addComment = (idx) => {
  if (!user) { modRead.style.display = "none"; openCms(); return; }
  const inp = document.getElementById("inp-cmt");
  const txt = inp ? inp.value.trim() : "";
  if (!txt) return alert("Digite seu comentário antes de enviar.");
  if (!news[idx].cmts) news[idx].cmts = [];
  news[idx].cmts.unshift({ n: user.n, w: user.w || "", r: user.r, d: new Date().toLocaleDateString("pt-BR"), t: txt });
  localStorage.setItem("cms_n", JSON.stringify(news));
  openNewsModal(idx);
  renderNews();
};
window.delComment = (nIdx, cIdx) => {
  if (!confirm("Apagar este comentário?")) return;
  news[nIdx].cmts.splice(cIdx, 1);
  localStorage.setItem("cms_n", JSON.stringify(news));
  openNewsModal(nIdx);
  renderNews();
};
window.openNewsModal = (idx) => {
  const n = news[idx]; if (!n) return;
  const cmts = n.cmts || [], adm = user && user.r === "admin";
  const p = n.x.split(/\n+/).filter(s => s.trim()).map(s => `<p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.7;text-align:justify">${s}</p>`).join("");
  const cmtHtml = cmts.length ? cmts.map((c, ci) => `<div style="background:#f8f9fa;border-left:3px solid ${c.r === "admin" ? "#E30613" : "#002454"};padding:10px 12px;border-radius:4px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><strong style="font-size:13px;color:#002454">${c.n} ${c.w ? `<span style="background:#e9ecef;padding:2px 6px;border-radius:3px;font-size:11px">${c.w}</span>` : ""} ${c.r === "admin" ? `<span style="background:#E30613;color:#fff;padding:1px 6px;border-radius:3px;font-size:10px">REDAÇÃO</span>` : ""}</strong><div><small style="color:#777;font-size:11px;margin-right:8px">${c.d}</small>${adm ? `<button onclick="delComment(${idx},${ci})" style="background:#dc3545;color:#fff;border:none;font-size:10px;padding:2px 6px;border-radius:3px;cursor:pointer">APAGAR</button>` : ""}</div></div><p style="margin:0;color:#333;font-size:14px;line-height:1.4">${c.t}</p></div>`).join("") : `<p style="color:#777;font-size:13px;margin:0 0 12px">Nenhum comentário ainda. Seja o primeiro a comentar!</p>`;
  const formCmt = user ? `<div style="margin-bottom:14px"><textarea id="inp-cmt" rows="3" placeholder="Escreva seu comentário como ${user.n}..." style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-family:sans-serif;margin-bottom:6px"></textarea><button onclick="addComment(${idx})" style="background:#002454;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px">PUBLICAR COMENTÁRIO</button></div>` : `<div style="background:#f4f6f9;padding:12px;border-radius:6px;text-align:center;margin-bottom:14px"><p style="margin:0 0 8px;font-size:13px;color:#002454">Entre na sua conta para participar da discussão!</p><button onclick="modRead.style.display='none';openCms()" style="background:#E30613;color:#fff;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;font-size:12px">ENTRAR OU CRIAR CONTA</button></div>`;
  document.getElementById("read-body").innerHTML = `<span style="background:#E30613;color:#fff;font-size:11px;font-weight:bold;padding:3px 8px;border-radius:4px">MATÉRIA EDITORIAL • ${n.d}</span><h2 style="margin:10px 0 16px;color:#002454;font-size:24px">${n.t}</h2>${n.img ? `<img src="${n.img}" style="width:100%;max-height:420px;object-fit:cover;border-radius:8px;margin-bottom:18px">` : ""}<div>${p}</div>${n.f ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee"><a href="${n.f}" target="_blank" style="display:inline-block;background:#002454;color:#fff;font-size:12px;font-weight:bold;text-decoration:none;padding:8px 14px;border-radius:4px">✓ ACESSAR FONTE OFICIAL WCA</a></div>` : ""}<div style="margin-top:22px;padding-top:16px;border-top:2px solid #002454"><h4 style="margin:0 0 12px;color:#002454;font-size:16px">COMENTÁRIOS DA COMUNIDADE (${cmts.length})</h4>${formCmt}<div>${cmtHtml}</div></div>`;
  modRead.style.display = "flex";
};
window.delNews = (idx, ev) => { ev.stopPropagation(); if (!confirm("Excluir matéria?")) return; news.splice(idx, 1); localStorage.setItem("cms_n", JSON.stringify(news)); renderNews(); };
function renderNews() {
  let c = document.getElementById("dyn-news");
  if (!c) { const ref = Array.from(document.querySelectorAll("*")).find(e => e.textContent.trim() === "Portal Oficial Cubo Mágico MS no Ar")?.closest("div")?.parentElement; if (!ref) return; c = document.createElement("div"); c.id = "dyn-news"; ref.prepend(c); }
  const adm = user && user.r === "admin";
  c.innerHTML = news.map((n, idx) => {
    const q = (n.cmts || []).length;
    return `<div onclick="openNewsModal(${idx})" style="cursor:pointer;background:#fff;border-left:4px solid #E30613;padding:16px 20px;margin-bottom:12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.06)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap"><small style="color:#E30613;font-weight:bold">MATÉRIA EDITORIAL • ${n.d}</small><div style="display:flex;gap:6px">${n.f ? `<a href="${n.f}" target="_blank" onclick="event.stopPropagation()" style="font-size:11px;color:#002454;font-weight:bold;text-decoration:none;border:1px solid #002454;padding:2px 8px;border-radius:4px">✓ FONTE WCA</a>` : ""}${adm ? `<button onclick="delNews(${idx}, event)" style="background:#dc3545;color:#fff;border:none;font-size:11px;font-weight:bold;padding:3px 8px;border-radius:4px;cursor:pointer">EXCLUIR</button>` : ""}</div></div><h4 style="margin:0 0 6px;color:#002454;font-size:18px">${n.t}</h4><p style="margin:0 0 10px;color:#444;font-size:14px;line-height:1.5">${n.x.slice(0, 210).trim()}...</p><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:#E30613;font-size:12px;font-weight:bold">LER MATÉRIA COMPLETA E VER FOTO →</span><span style="color:#002454;font-size:12px;font-weight:bold">💬 ${q} ${q === 1 ? "comentário" : "comentários"}</span></div></div>`;
  }).join("");
}
updateBtn(); renderNews();
