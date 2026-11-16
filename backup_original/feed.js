const postsBase = [{ id: 1, autor: "Cubo Mágico MS • Oficial", iniciais: "CMS", data: "Hoje", texto: "Bem-vindos ao Feed Cubista! Compartilhem fotos, vídeos de solves e PBs aqui.", tempo: "", mod: "", scramble: "", midia: "", tipoMidia: "", reacoes: { "👍": 1, "❤️": 0, "🔥": 0, "🤯": 0, "👏": 0 }, minhaReacao: "", comentarios: [] }];
let postsCubistas = JSON.parse(localStorage.getItem("cms_feed_v2")) || postsBase;
let midiaBase64Temp = "", tipoMidiaTemp = "";

function salvarFeed() { localStorage.setItem("cms_feed_v2", JSON.stringify(postsCubistas)); }
function toggleBox(id, d) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === "none" ? d : "none"; }

function lerArquivoMidia(input) {
  const file = input.files && input.files.item(0);
  if (!file) return;
  document.getElementById("nome-arquivo-midia").textContent = file.name;
  tipoMidiaTemp = file.type.startsWith("video") ? "video" : "imagem";
  const reader = new FileReader();
  reader.onload = (e) => { midiaBase64Temp = e.target.result; };
  reader.readAsDataURL(file);
}

function extrairUrlMidia(url) {
  if (!url) return { src: "", tipo: "" };
  if (url.includes("://youtube.com")) return { src: "https://youtube.com" + url.split("v=").at(1).split("&").at(0), tipo: "youtube" };
  if (url.includes("youtu.be/")) return { src: "https://youtube.com" + url.split("youtu.be/").at(1).split("?").at(0), tipo: "youtube" };
  if (url.match(/\.(mp4|webm|ogg)$/i)) return { src: url, tipo: "video" };
  return { src: url, tipo: "imagem" };
}

function publicarNoFeed() {
  const texto = document.getElementById("feed-texto").value.trim();
  const tempo = document.getElementById("feed-tempo").value.trim();
  const mod = document.getElementById("feed-mod").value;
  const scramble = document.getElementById("feed-scramble").value.trim();
  const urlDigitada = document.getElementById("feed-url-midia").value.trim();
  let midiaFinal = midiaBase64Temp, tipoFinal = tipoMidiaTemp;
  if (!midiaFinal && urlDigitada) { const res = extrairUrlMidia(urlDigitada); midiaFinal = res.src; tipoFinal = res.tipo; }
  if (!texto && !tempo && !midiaFinal) return alert("Escreva algo, adicione foto/vídeo ou registre um tempo!");
  postsCubistas.unshift({ id: Date.now(), autor: "Jefferson", iniciais: "JF", data: "Agora mesmo", texto: texto || (tempo ? `Novo tempo no ${mod}!` : ""), tempo, mod, scramble, midia: midiaFinal, tipoMidia: tipoFinal, reacoes: { "👍": 0, "❤️": 0, "🔥": 0, "🤯": 0, "👏": 0 }, minhaReacao: "", comentarios: [] });
  salvarFeed();
  ["feed-texto","feed-tempo","feed-scramble","feed-url-midia"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  document.getElementById("nome-arquivo-midia").textContent = "Nenhum arquivo selecionado";
  midiaBase64Temp = ""; tipoMidiaTemp = "";
  document.getElementById("feed-tempo-box").style.display = "none";
  document.getElementById("feed-midia-box").style.display = "none";
  renderFeed();
}
function reagirPost(id, emoji) {
  const p = postsCubistas.find(x => x.id === id);
  if (!p) return;
  if (p.minhaReacao === emoji) { p.reacoes[emoji] = Math.max(0, (p.reacoes[emoji] || 1) - 1); p.minhaReacao = ""; }
  else { if (p.minhaReacao) p.reacoes[p.minhaReacao] = Math.max(0, (p.reacoes[p.minhaReacao] || 1) - 1); p.reacoes[emoji] = (p.reacoes[emoji] || 0) + 1; p.minhaReacao = emoji; }
  salvarFeed(); renderFeed();
}

function comentarFeed(id, e) {
  e.preventDefault();
  const inp = document.getElementById(`inp-com-${id}`);
  if (!inp || !inp.value.trim()) return;
  const p = postsCubistas.find(x => x.id === id);
  if (p) { p.comentarios.push({ id: Date.now(), autor: "Jefferson", texto: inp.value.trim(), likes: 0, liked: false, respostas: [] }); salvarFeed(); renderFeed(); }
}

function curtirComentario(postId, comId) {
  const c = postsCubistas.find(x => x.id === postId)?.comentarios.find(x => x.id === comId);
  if (c) { c.liked = !c.liked; c.likes += c.liked ? 1 : -1; salvarFeed(); renderFeed(); }
}

function responderComentario(postId, comId) {
  const resp = prompt("Escreva sua resposta:");
  if (!resp || !resp.trim()) return;
  const c = postsCubistas.find(x => x.id === postId)?.comentarios.find(x => x.id === comId);
  if (c) { c.respostas = c.respostas || []; c.respostas.push({ autor: "Jefferson", texto: resp.trim() }); salvarFeed(); renderFeed(); }
}

function renderFeed() {
  const box = document.getElementById("feed-lista");
  if (!box) return;
  box.innerHTML = postsCubistas.map(p => {
    const totalReacoes = Object.values(p.reacoes || {}).reduce((a, b) => a + b, 0);
    const emojisAtivos = Object.entries(p.reacoes || {}).filter(([_, qtd]) => qtd > 0).map(([em]) => em).join("");
    let htmlMidia = "";
    if (p.midia) {
      if (p.tipoMidia === "youtube") htmlMidia = `<iframe class="post-media" style="height:320px;" src="${p.midia}" frameborder="0" allowfullscreen></iframe>`;
      else if (p.tipoMidia === "video") htmlMidia = `<video class="post-media" controls src="${p.midia}"></video>`;
      else htmlMidia = `<img class="post-media" src="${p.midia}" alt="Mídia">`;
    }
    const htmlComentarios = (p.comentarios || []).map(c => `<div style="margin-bottom:8px;"><div class="comment-bubble"><strong>${c.autor}:</strong> ${c.texto}</div><div class="comment-meta"><span style="color:${c.liked ? "#E30613" : "#65676b"}" onclick="curtirComentario(${p.id}, ${c.id})">👍 Curtir ${c.likes > 0 ? `(${c.likes})` : ""}</span><span onclick="responderComentario(${p.id}, ${c.id})">Responder</span></div>${(c.respostas || []).length ? `<div class="reply-list">${c.respostas.map(r => `<div style="margin-bottom:4px;"><div class="comment-bubble" style="background:#e9ebee;"><strong>${r.autor}:</strong> ${r.texto}</div></div>`).join("")}</div>` : ""}</div>`).join("");
    return `<div class="social-card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="width:38px;height:38px;border-radius:50%;background:#002454;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;">${p.iniciais || "CM"}</div><div><strong style="color:#002454;font-size:14px;display:block;">${p.autor}</strong><span style="font-size:12px;color:#65676b;">${p.data}</span></div></div>${p.texto ? `<p style="font-size:14px;line-height:1.45;margin-bottom:6px;">${p.texto}</p>` : ""}${p.tempo ? `<div class="solve-badge"><strong style="font-size:18px;color:#002454;">⏱️ ${p.tempo}</strong> <span style="font-size:12px;color:#E30613;font-weight:bold;">(${p.mod})</span>${p.scramble ? `<div style="font-family:monospace;font-size:12px;color:#555;margin-top:4px;">Scramble: ${p.scramble}</div>` : ""}</div>` : ""}${htmlMidia}<div style="display:flex;justify-content:space-between;font-size:12px;color:#65676b;margin-top:10px;padding-bottom:6px;"><span>${emojisAtivos} ${totalReacoes > 0 ? totalReacoes + " reações" : "Seja o primeiro a reagir"}</span><span>${(p.comentarios || []).length} comentários</span></div><div class="social-actions" style="margin-top:0;"><div class="reaction-wrapper"><div class="reaction-bar">${["👍","❤️","🔥","🤯","👏"].map(em => `<button type="button" class="react-emoji" onclick="reagirPost(${p.id}, '${em}')">${em}</button>`).join("")}</div><button type="button" class="btn-social-gray" style="width:100%;color:${p.minhaReacao ? "#E30613" : "#002454"}" onclick="reagirPost(${p.id}, '👍')">${p.minhaReacao || "👍"} ${p.minhaReacao ? "Reagiu" : "Curtir"}</button></div><button type="button" class="btn-social-gray" style="flex:1;margin-left:8px;" onclick="document.getElementById('inp-com-${p.id}').focus()">💬 Comentar</button></div><div style="margin-top:12px;padding-top:10px;border-top:1px solid #eee;">${htmlComentarios}<form onsubmit="comentarFeed(${p.id}, event)" style="display:flex;gap:8px;margin-top:6px;"><input type="text" id="inp-com-${p.id}" placeholder="Escreva um comentário..." style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:8px 14px;font-size:13px;outline:none;"><button type="submit" class="btn-social-red" style="padding:6px 14px;font-size:12px;">Enviar</button></form></div></div>`;
  }).join("");
  if (typeof renderTopPostWidget === "function") renderTopPostWidget();
}
function gerarScrambleSidebar() {
  const movs = ["R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"];
  let s = [], ult = "";
  while (s.length < 20) { const m = movs[Math.floor(Math.random() * movs.length)]; if (m !== ult) { s.push(m); ult = m; } }
  document.getElementById("sidebar-scramble-box").style.display = "block";
  document.getElementById("sidebar-scramble-txt").textContent = s.join(" ");
}

const recordesWCA = [
  { id: "wr333s", mod: "3x3x3 Cube • Single", tempo: "2.51s", atleta: "Xuanyi Geng (China)", wcaId: "2023GENG02", evento: "Guangzhou Grand Open 2026" },
  { id: "wr333a", mod: "3x3x3 Cube • Média (Ao5)", tempo: "3.51s", atleta: "Yiheng Wang (China)", wcaId: "2019WANG01", evento: "Hefei Cubing League 2026" },
  { id: "wr222s", mod: "2x2x2 Cube • Single", tempo: "0.39s", atleta: "Ziyu Ye (China)", wcaId: "2023YEZI01", evento: "Hefei Open 2025" },
  { id: "wrohs",  mod: "3x3x3 Uma Mão • Single", tempo: "5.62s", atleta: "Patrick Ponce (EUA)", wcaId: "2012PONC02", evento: "Mid-Atlantic Championship 2026" }
];
let wrLikesReal = JSON.parse(localStorage.getItem("cms_wr_likes_real")) || {};
let idxWR = 0;

function renderWRCarousel() {
  const box = document.getElementById("wr-carousel-box");
  if (!box) return;
  const r = recordesWCA.at(idxWR);
  const count = wrLikesReal[r.id] || 0;
  const liked = count > 0;
  box.innerHTML = `<div><div style="font-size:12px;font-weight:700;color:#002454;">${r.mod}</div><div style="font-size:28px;font-weight:900;color:#E30613;margin:4px 0;">${r.tempo}</div><a href="https://worldcubeassociation.org{r.wcaId}" target="_blank" style="font-size:13px;font-weight:800;color:#002454;text-decoration:underline;display:inline-block;margin-bottom:2px;">${r.atleta} ↗</a><div style="font-size:11px;color:#65676b;margin-bottom:10px;">${r.evento}</div><div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #eee;padding-top:8px;"><button type="button" onclick="curtirWR('${r.id}')" style="background:${liked ? "#ffe8ea" : "#f0f2f5"};color:${liked ? "#E30613" : "#002454"};border:none;padding:5px 12px;border-radius:16px;font-weight:700;font-size:12px;cursor:pointer;">${liked ? "❤️ Curtido" : "👍 Curtir"} (${count})</button><span style="font-size:11px;color:#888;">${idxWR + 1}/${recordesWCA.length}</span></div></div>`;
}
function mudarSlideWR(dir) { idxWR = (idxWR + dir + recordesWCA.length) % recordesWCA.length; renderWRCarousel(); }
function curtirWR(id) { wrLikesReal[id] = (wrLikesReal[id] || 0) > 0 ? 0 : 1; localStorage.setItem("cms_wr_likes_real", JSON.stringify(wrLikesReal)); renderWRCarousel(); }

function renderTopPostWidget() {
  const box = document.getElementById("top-post-widget");
  if (!box || !postsCubistas.length) return;
  const top = [...postsCubistas].sort((a, b) => Object.values(b.reacoes || {}).reduce((x, y) => x + y, 0) - Object.values(a.reacoes || {}).reduce((x, y) => x + y, 0)).at(0);
  const total = Object.values(top.reacoes || {}).reduce((x, y) => x + y, 0);
  box.innerHTML = `<div style="background:#f8f9fa;padding:10px;border-radius:8px;border:1px solid #eee;"><strong style="font-size:12px;color:#002454;display:block;">${top.autor}</strong><p style="font-size:12px;color:#333;margin:5px 0;line-height:1.35;">${(top.texto || top.tempo).slice(0, 95)}${(top.texto || "").length > 95 ? "..." : ""}</p><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;"><span style="font-size:11px;font-weight:bold;color:#E30613;">🔥 ${total} reações</span><button type="button" onclick="reagirPost(${top.id}, '🔥')" style="background:#002454;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">Dar Like</button></div></div>`;
}

let listaCompsWCA = [], idxComp = 0;
function renderCompCarousel() {
  const w = document.getElementById("widget-comps-laterais");
  if (!w) return;
  if (!listaCompsWCA.length) { w.innerHTML = "<p style='font-size:12px;color:#666;'>Nenhuma competição encontrada.</p>"; return; }
  const c = listaCompsWCA.at(idxComp);
  const urlInscricao = c.url || `https://worldcubeassociation.org{c.id}/register`;
  w.innerHTML = `<div style="background:#f8f9fa;border:1px solid #e4e6eb;border-radius:10px;padding:12px;"><span style="background:#002454;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">${c.start_date}</span><h5 style="margin:0 0 4px 0;font-size:14px;color:#002454;font-weight:800;">${c.name}</h5><p style="margin:0 0 4px 0;font-size:12px;color:#444;">📍 ${c.city}</p><p style="margin:0 0 10px 0;font-size:11px;color:#65676b;">👥 Limite: ${c.competitor_limit || "Aberto"} competidores</p><div style="display:flex;justify-content:space-between;align-items:center;"><a href="${urlInscricao}" target="_blank" style="background:#E30613;color:#fff;text-decoration:none;font-size:11px;font-weight:800;padding:6px 12px;border-radius:6px;">INSCREVER-SE ↗</a><span style="font-size:11px;color:#888;">${idxComp + 1}/${listaCompsWCA.length}</span></div></div>`;
}
function mudarSlideComp(dir) { if (!listaCompsWCA.length) return; idxComp = (idxComp + dir + listaCompsWCA.length) % listaCompsWCA.length; renderCompCarousel(); }

async function iniciarWidgetCompsWCA() {
  const hoje = new Date().toISOString().split("T").at(0);
  try {
    const r = await fetch(`https://worldcubeassociation.org{hoje}&sort=start_date`);
    const dados = await r.json();
    if (Array.isArray(dados) && dados.length) { listaCompsWCA = dados.filter(c => !c.cancelled_at).slice(0, 8); renderCompCarousel(); setInterval(() => mudarSlideComp(1), 5500); return; }
  } catch {}
  try {
    const rLocal = await fetch("competicoes_br.json?t=" + Date.now());
    const dLocal = await rLocal.json();
    const arr = Array.isArray(dLocal) ? dLocal : (dLocal.competitions || dLocal.items || []);
    listaCompsWCA = arr.filter(c => (c.start_date || "") >= hoje).slice(0, 8);
    renderCompCarousel(); setInterval(() => mudarSlideComp(1), 5500);
  } catch {}
}

document.querySelector('[data-tab="tab-feed"]')?.addEventListener("click", () => {
  document.getElementById("hero-titulo").textContent = "COMUNIDADE & FEED DOS CUBISTAS";
  document.getElementById("hero-sub").textContent = "Compartilhe fotos, vídeos de solves, melhores tempos (PBs) e novidades do cubo mágico.";
});

setInterval(() => mudarSlideWR(1), 6500);
renderWRCarousel();
iniciarWidgetCompsWCA();
renderFeed();
