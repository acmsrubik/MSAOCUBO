window.formatarDataPostFB = function(p) {
  if (p.id && typeof p.id === "number" && p.id > 1600000000000) {
    const d = new Date(p.id);
    if (!isNaN(d.getTime())) {
      const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
      const dia = d.getDate();
      const mes = meses[d.getMonth()];
      const hora = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${dia} de ${mes} às ${hora}:${min}`;
    }
  }
  return p.data || "Hoje";
};

window.mostrarHoverCardPerfil = function(event, nome) {
  if (!nome || nome === "Cubo Mágico MS • Oficial") return;
  clearTimeout(window._hoverCardTimer);
  const cadastrados = JSON.parse(localStorage.getItem("cms_u") || "[]");
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  const alvoLower = nome.trim().toLowerCase();
  let alvo = cadastrados.find(u => u.n && (u.n.toLowerCase() === alvoLower || alvoLower.startsWith(u.n.toLowerCase()) || u.n.toLowerCase().startsWith(alvoLower)));
  if (!alvo && (alvoLower.includes("jefferson") || (eu.n && alvoLower.startsWith(eu.n.toLowerCase())))) alvo = eu;
  if (!alvo) return;

  const extra = perfis[alvo.e] || {};
  const meuExtra = perfis[eu.e] || {};
  const isMe = alvo.e === eu.e;
  const isFriend = (meuExtra.amigos || []).includes(alvo.e);
  const ini = alvo.n.slice(0, 2).toUpperCase();
  const avatarHtml = extra.avatar
    ? `<img src="${extra.avatar}" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid #e4e6eb;flex-shrink:0;">`
    : `<div style="width:76px;height:76px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;flex-shrink:0;">${ini}</div>`;

  let card = document.getElementById("fb-profile-hover-card");
  if (!card) {
    card = document.createElement("div");
    card.id = "fb-profile-hover-card";
    card.onmouseenter = () => clearTimeout(window._hoverCardTimer);
    card.onmouseleave = () => window.esconderHoverCardPerfil();
    document.body.appendChild(card);
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const top = Math.min(window.innerHeight - 230, rect.bottom + 8);
  const left = Math.min(window.innerWidth - 360, Math.max(12, rect.left));

  card.style.cssText = `position:fixed;top:${top}px;left:${left}px;width:340px;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.22);border:1px solid #dddfe2;padding:16px;z-index:99999;font-family:inherit;`;
  card.innerHTML = `
    <div style="display:flex;gap:14px;align-items:center;">
      <div onclick="window.abrirPerfilCubista('${alvo.e}');window.esconderHoverCardPerfil();" style="cursor:pointer;">${avatarHtml}</div>
      <div style="flex:1;min-width:0;">
        <div onclick="window.abrirPerfilCubista('${alvo.e}');window.esconderHoverCardPerfil();" style="font-size:17px;font-weight:800;color:#050505;cursor:pointer;line-height:1.2;margin-bottom:6px;">${alvo.n}</div>
        ${extra.cidade ? `<div style="font-size:13px;color:#65676b;margin-bottom:3px;">🏠 Mora em <strong>${extra.cidade}</strong></div>` : ""}
        ${extra.cuboMain ? `<div style="font-size:13px;color:#65676b;margin-bottom:3px;">🧊 Cubo: <strong>${extra.cuboMain}</strong></div>` : ""}
        ${extra.wcaData?.id ? `<div style="font-size:13px;color:#65676b;">🏅 WCA: <strong>${extra.wcaData.id}</strong></div>` : ""}
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px;">
      ${isMe
        ? `<button onclick="window.abrirPerfilCubista('${alvo.e}');window.esconderHoverCardPerfil();" style="flex:1;padding:8px 12px;background:#1877f2;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;">Ver meu perfil</button>
           <button onclick="window.abrirPerfilCubista('${alvo.e}');setTimeout(()=>window.abrirEditorApresentacao('${alvo.e}'),100);window.esconderHoverCardPerfil();" style="flex:1;padding:8px 12px;background:#e4e6eb;color:#050505;border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;">✏️ Editar perfil</button>`
        : `<button onclick="window.alternarAmizade('${alvo.e}');window.esconderHoverCardPerfil();" style="flex:1;padding:8px 12px;background:${isFriend ? "#e7f3ff" : "#1877f2"};color:${isFriend ? "#1877f2" : "#fff"};border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;">${isFriend ? "✓ Amigos" : "+ Adicionar amigo"}</button>
           <button onclick="window.abrirPerfilCubista('${alvo.e}');window.esconderHoverCardPerfil();" style="padding:8px 12px;background:#e4e6eb;color:#050505;border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;">Ver perfil</button><button onclick="if(window.abrirJanelaChatFB) window.abrirJanelaChatFB('${alvo.e}','${alvo.n.replace(/'/g,"\\'")}');window.esconderHoverCardPerfil();" style="padding:8px 10px;background:#e4e6eb;color:#050505;border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;">💬</button>`
      }
    </div>
  `;
  card.style.display = "block";
};

window.esconderHoverCardPerfil = function() {
  window._hoverCardTimer = setTimeout(() => {
    const card = document.getElementById("fb-profile-hover-card");
    if (card) card.style.display = "none";
  }, 260);
};

window.abrirPerfilPorNome = function(nome) {
  if (!nome || nome === "Cubo Mágico MS • Oficial") return;
  const cadastrados = JSON.parse(localStorage.getItem("cms_u") || "[]");
  const s = JSON.parse(localStorage.getItem("cms_s") || "null") || { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  const alvoLower = nome.trim().toLowerCase();
  let encontrado = cadastrados.find(u => u.n && (u.n.toLowerCase() === alvoLower || alvoLower.startsWith(u.n.toLowerCase()) || u.n.toLowerCase().startsWith(alvoLower)));
  if (!encontrado && (alvoLower.includes("jefferson") || (s.n && alvoLower.startsWith(s.n.toLowerCase())))) {
    encontrado = s;
  }
  if (encontrado && window.abrirPerfilCubista) {
    window.abrirPerfilCubista(encontrado.e);
  }
};

window.getFotoAvatarCMS = function(nome, iniciais, size, bg) {
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const s = JSON.parse(localStorage.getItem("cms_s") || "null") || { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  let foto = "";
  if (nome && nome !== "Cubo Mágico MS • Oficial") {
    if (s.n && nome.toLowerCase().startsWith(s.n.toLowerCase()) && perfis[s.e]?.avatar) {
      foto = perfis[s.e].avatar;
    } else if (nome.toLowerCase().includes("jefferson")) {
      const k = Object.keys(perfis).find(e => perfis[e]?.avatar);
      if (k) foto = perfis[k].avatar;
    }
  }
  const ini = (iniciais || (nome || "CM").slice(0, 2)).toUpperCase();
  if (foto) {
    return `<img src="${foto}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #dddfe2;">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;flex-shrink:0;">${ini}</div>`;
};

window.aplicarFotoPerfilGlobal = function() {
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const s = JSON.parse(localStorage.getItem("cms_s") || "null") || { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  const foto = perfis[s.e]?.avatar || Object.values(perfis).find(x => x && x.avatar)?.avatar || "";
  if (!foto) return;

  const btnTopo = document.getElementById("btn-topo-meu-perfil");
  if (btnTopo && !btnTopo.querySelector("img")) {
    btnTopo.style.cssText = "padding:0;overflow:hidden;border:2px solid #1877f2;";
    btnTopo.innerHTML = `<img src="${foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }

  document.querySelectorAll(".fb-left div, .feed-box div, .social-card div").forEach(el => {
    if (el.children.length === 0 && /^(JF|JE)$/i.test(el.textContent.trim())) {
      const w = el.offsetWidth || 38;
      const h = el.offsetHeight || 38;
      el.innerHTML = `<img src="${foto}" style="width:${w}px;height:${h}px;border-radius:50%;object-fit:cover;display:block;">`;
      el.style.background = "transparent";
      el.style.padding = "0";
      el.style.overflow = "hidden";
    }
  });
};
document.addEventListener("DOMContentLoaded", () => setTimeout(window.aplicarFotoPerfilGlobal, 300));
setInterval(window.aplicarFotoPerfilGlobal, 1200);

window.getAvatarUsuarioCMS = function(email, nome, iniciais, size = 38, bg = "#002454") {
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const usuarios = JSON.parse(localStorage.getItem("cms_u") || "[]");
  const sessao = JSON.parse(localStorage.getItem("cms_s") || "null");
  let foto = "";
  if (email && perfis[email]?.avatar) {
    foto = perfis[email].avatar;
  } else if (nome) {
    const uMatch = usuarios.find(u => u.n && nome.toLowerCase().startsWith(u.n.toLowerCase()));
    if (uMatch && perfis[uMatch.e]?.avatar) foto = perfis[uMatch.e].avatar;
    else if (sessao && sessao.n && nome.toLowerCase().startsWith(sessao.n.toLowerCase()) && perfis[sessao.e]?.avatar) {
      foto = perfis[sessao.e].avatar;
    } else {
      const primeiroEmail = Object.keys(perfis).find(k => perfis[k]?.avatar && nome.toLowerCase().includes("jefferson"));
      if (primeiroEmail) foto = perfis[primeiroEmail].avatar;
    }
  }
  const ini = (iniciais || (nome || "CM").slice(0, 2)).toUpperCase();
  if (foto) {
    return `<img src="${foto}" alt="${nome || ""}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #dddfe2;">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${Math.round(size*0.35)}px;flex-shrink:0;">${ini}</div>`;
};


window.abrirRespostaInline = function(el, postId, comIdx) {
  const boxId = `reply-inline-${postId}-${comIdx}`;
  const existente = document.getElementById(boxId);
  if (existente) { existente.remove(); return; }
  const p = postsCubistas.find(x => x.id === postId);
  if (!p || !p.comentarios[comIdx]) return;
  const meta = el.closest(".comment-meta") || el.parentElement;
  const form = document.createElement("form");
  form.id = boxId;
  form.style.cssText = "display:flex;gap:6px;margin:6px 0 8px 24px;align-items:center;";
  form.innerHTML = `<input type="text" placeholder="Responder a ${p.comentarios[comIdx].autor}..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:7px 12px;font-size:12px;outline:none;"><button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>`;
  form.onsubmit = function(ev) {
    ev.preventDefault();
    const txt = form.querySelector("input").value.trim();
    if (!txt) return;
    const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
    p.comentarios[comIdx].respostas = p.comentarios[comIdx].respostas || [];
    p.comentarios[comIdx].respostas.push({ autor: eu, texto: txt });
    salvarFeed();
    renderFeed();
    if (window.renderPerfil) window.renderPerfil();
  };
  meta.insertAdjacentElement("afterend", form);
  form.querySelector("input").focus();
};

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
  if (url.includes("://youtube.com")) return { src: "https://youtube.com" + "/embed/" + "/embed/" + url.split("v=").at(1).split("&").at(0), tipo: "youtube" };
  if (url.includes("youtu.be/")) return { src: "https://youtube.com" + "/embed/" + "/embed/" + url.split("youtu.be/").at(1).split("?").at(0), tipo: "youtube" };
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
  postsCubistas.unshift({ id: Date.now(), autor: (JSON.parse(localStorage.getItem("cms_s")||"null")?.n || "Jefferson"), autorEmail: (JSON.parse(localStorage.getItem("cms_s")||"null")?.e || "jefferson@cubomagicoms.com.br"), iniciais: (JSON.parse(localStorage.getItem("cms_s")||"null")?.n || "Jefferson").slice(0,2).toUpperCase(), data: "Agora mesmo", texto: texto || (tempo ? `Novo tempo no ${mod}!` : ""), tempo, mod, scramble, midia: midiaFinal, tipoMidia: tipoFinal, reacoes: { "👍": 0, "❤️": 0, "🔥": 0, "🤯": 0, "👏": 0 }, minhaReacao: "", comentarios: [] });
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

function responderComentario(postId, comIdx) {
  const boxId = `reply-box-${postId}-${comIdx}`;
  let box = document.getElementById(boxId);
  if (box) { box.remove(); return; }

  const p = postsCubistas.find(x => x.id === postId);
  if (!p || !p.comentarios[comIdx]) return;
  const alvoAutor = p.comentarios[comIdx].autor;

  const spanClicado = event && event.target ? event.target : null;
  const containerMeta = spanClicado ? spanClicado.closest(".comment-meta") : null;
  if (!containerMeta) return;

  box = document.createElement("form");
  box.id = boxId;
  box.style.cssText = "display:flex;gap:6px;margin:6px 0 10px 26px;align-items:center;";
  box.innerHTML = `
    <input type="text" placeholder="Responder a ${alvoAutor}..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:7px 12px;font-size:12px;outline:none;">
    <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>
  `;
  box.onsubmit = (e) => {
    e.preventDefault();
    const val = box.querySelector("input").value.trim();
    if (!val) return;
    const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
    p.comentarios[comIdx].respostas = p.comentarios[comIdx].respostas || [];
    p.comentarios[comIdx].respostas.push({ autor: eu, texto: val });
    salvarFeed();
    renderFeed();
    if (window.renderPerfil) window.renderPerfil();
  };
  containerMeta.insertAdjacentElement("afterend", box);
  box.querySelector("input").focus();
}

function extrairIdYoutubeFB(str) {
  if (!str) return "";
  const m = String(str).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m.at(1) : "";
}

window.tocarUnicoVideoFeed = function(el, vidId, mudoAuto = false) {
  document.querySelectorAll(".cms-yt-active-box").forEach(box => {
    const oldId = box.getAttribute("data-vid");
    box.outerHTML = window.gerarCapaYoutubeHTML(oldId);
  });
  document.querySelectorAll("video").forEach(v => v.pause());
  const emb = ["https://youtube.com", "embed", vidId + "?autoplay=1&rel=0"].join("/");
  el.outerHTML = `<div class="cms-yt-active-box" data-vid="${vidId}" style="margin-top:10px;border-radius:10px;overflow:hidden;background:#000;">
    <iframe style="width:100%;height:340px;border:none;display:block;" src="${emb}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>`;
};

window.gerarCapaYoutubeHTML = function(vidId) {
  const P = String.fromCharCode(46);
  const thumb = "https://i" + P + "ytimg" + P + "com/vi/" + vidId + "/hqdefault.jpg";
  const fallback = "https://img" + P + "youtube" + P + "com/vi/" + vidId + "/0.jpg";
  return `<div data-yt-auto="${vidId}" onclick="window.tocarUnicoVideoFeed(this, '${vidId}', false)" style="position:relative;margin-top:10px;border-radius:10px;overflow:hidden;cursor:pointer;background:#000;aspect-ratio:16/9;">
    <img src="${thumb}" onerror="this.onerror=null;this.src='${fallback}'" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:0.92;">
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.22);">
      <div style="width:64px;height:44px;background:#ff0000;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,0.5);">▶</div>
    </div>
  </div>`;
};

window.toggleMenuPostFB = function(e, postId) {
  e.stopPropagation();
  const idMenu = "post-menu-drop-" + postId;
  const existente = document.getElementById(idMenu);
  document.querySelectorAll(".cms-post-menu-drop").forEach(el => el.remove());
  if (existente) return;

  const p = postsCubistas.find(x => x.id === postId);
  if (!p) return;
  const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
  const souDono = p.autorEmail === eu.e;

  const menu = document.createElement("div");
  menu.id = idMenu;
  menu.className = "cms-post-menu-drop";
  menu.onclick = (ev) => ev.stopPropagation();
  menu.style.cssText = "position:absolute;top:36px;right:0;width:220px;background:#fff;border-radius:10px;box-shadow:0 6px 22px rgba(0,0,0,0.2);border:1px solid #dddfe2;z-index:999;padding:6px;display:flex;flex-direction:column;gap:2px;";
  menu.innerHTML = `
    <button type="button" onclick="window.compartilharPostFB(${postId})" style="text-align:left;padding:9px 12px;border:none;background:transparent;border-radius:8px;font-size:13px;font-weight:600;color:#050505;cursor:pointer;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='transparent'">🚀 Compartilhar publicação</button>
    <button type="button" onclick="navigator.clipboard.writeText(window.location.href);document.querySelectorAll('.cms-post-menu-drop').forEach(el=>el.remove());alert('Link copiado!');" style="text-align:left;padding:9px 12px;border:none;background:transparent;border-radius:8px;font-size:13px;font-weight:600;color:#050505;cursor:pointer;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='transparent'">🔗 Copiar link</button>
    ${souDono ? `<button type="button" onclick="window.excluirPostFB(${postId})" style="text-align:left;padding:9px 12px;border:none;background:transparent;border-radius:8px;font-size:13px;font-weight:700;color:#dc2626;cursor:pointer;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">🗑️ Excluir publicação</button>` : ""}
  `;
  e.currentTarget.parentElement.appendChild(menu);
};

window.compartilharPostFB = function(postId) {
  document.querySelectorAll(".cms-post-menu-drop").forEach(el => el.remove());
  const p = postsCubistas.find(x => x.id === postId);
  if (!p) return;
  if (window.abrirGeradorDivulgacao) {
    window.abrirGeradorDivulgacao({
      titulo: p.autor,
      subtitulo: "Publicação no MS AO CUBO",
      destaque: (p.texto || (p.tempo ? "Solve: " + p.tempo : "Confira no Feed")).slice(0, 52)
    });
  }
};

window.excluirPostFB = function(postId) {
  document.querySelectorAll(".cms-post-menu-drop").forEach(el => el.remove());
  if (!confirm("Deseja realmente excluir esta publicação?")) return;
  const idx = postsCubistas.findIndex(x => x.id === postId);
  if (idx !== -1) {
    postsCubistas.splice(idx, 1);
    localStorage.setItem("cms_posts_v1", JSON.stringify(postsCubistas));
    localStorage.setItem("cms_feed_posts", JSON.stringify(postsCubistas));
    if (typeof renderFeed === "function") renderFeed();
    if (window.abrirPerfilCubista && document.getElementById("view-perfil")?.style.display !== "none") {
      window.abrirPerfilCubista();
    }
  }
};

document.addEventListener("click", () => document.querySelectorAll(".cms-post-menu-drop").forEach(el => el.remove()));

window.renderMidiaOuLinkFB = function(p) {
  const url = String(p.midia || "").trim();
  const vidId = extrairIdYoutubeFB(url) || extrairIdYoutubeFB(p.texto);
  if (vidId) return window.gerarCapaYoutubeHTML(vidId);
  if (!url) return "";
  if (p.tipoMidia === "video" || url.startsWith("data:video") || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `<video class="post-media" controls onplay="document.querySelectorAll('video').forEach(v=>{if(v!==this)v.pause()})" src="${url}"></video>`;
  }
  if (url.startsWith("data:image") || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) {
    return `<img class="post-media" loading="lazy" src="${url}" alt="Mídia">`;
  }
  let dominio = url;
  try { dominio = new URL(url).hostname.replace(/^www\./, ""); } catch (e) {}
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;padding:12px 14px;background:#f0f2f5;border:1px solid #dddfe2;border-radius:10px;text-decoration:none;color:#050505;">
    <div style="min-width:0;">
      <div style="font-size:11px;font-weight:700;color:#65676b;text-transform:uppercase;">🔗 ${dominio}</div>
      <div style="font-size:14px;font-weight:700;color:#1877f2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${url}</div>
      <div style="font-size:12px;color:#65676b;margin-top:2px;">Clique para abrir o link externo</div>
    </div>
    <span style="background:#1877f2;color:#fff;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:700;flex-shrink:0;">Abrir ↗</span>
  </a>`;
}

window.linkificarTextoFB = function(txt) {
  if (!txt) return "";
  return String(txt).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#1877f2;font-weight:600;text-decoration:underline;">$1</a>');
}

let filtroAtivoFeed = "todos";

window.setFiltroFeedCMS = function(tipo) {
  filtroAtivoFeed = tipo;
  renderFeed();
};



window.setFiltroFeedCMS = function(tipo) {
  filtroAtivoFeed = tipo;
  renderFeed();
};

window.renderFeed = function() {
  const box = document.getElementById("feed-lista");
  if (!box) return;
  const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const meusAmigos = new Set((perfis[eu.e]?.amigos || []).map(a => a.toLowerCase()));

  const listaFiltrada = postsCubistas.filter(p => {
    if (filtroAtivoFeed === "amigos") {
      return p.autorEmail === eu.e || meusAmigos.has((p.autor || "").toLowerCase());
    }
    if (filtroAtivoFeed === "solves") {
      return Boolean(p.tempo && String(p.tempo).trim());
    }
    if (filtroAtivoFeed === "midias") {
      return Boolean(p.midia) || Boolean(extrairIdYoutubeFB(p.texto));
    }
    return true;
  });

  const abasFeed = [
    { id: "todos", label: "🔥 Para Você" },
    { id: "amigos", label: "👥 Amigos" },
    { id: "solves", label: "⏱️ Solves & Recordes" },
    { id: "midias", label: "🎬 Vídeos & Fotos" }
  ];

  const barraFiltrosHtml = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;background:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,0.08);align-items:center;">
    ${abasFeed.map(a => `<button type="button" onclick="window.setFiltroFeedCMS('${a.id}')" style="padding:7px 14px;border-radius:20px;border:none;font-size:13px;font-weight:700;cursor:pointer;transition:0.15s;background:${filtroAtivoFeed===a.id?'#1877f2':'#f0f2f5'};color:${filtroAtivoFeed===a.id?'#fff':'#050505'};">${a.label}</button>`).join("")}
    <span style="margin-left:auto;font-size:12px;font-weight:700;color:#65676b;">${listaFiltrada.length} ${listaFiltrada.length === 1 ? "publicação" : "publicações"}</span>
  </div>`;

  const cardsHtml = listaFiltrada.length ? listaFiltrada.map(p => {
    const totalReacoes = Object.values(p.reacoes || {}).reduce((a, b) => a + b, 0);
    const emojisAtivos = Object.entries(p.reacoes || {}).filter(([_, qtd]) => qtd > 0).map(([em]) => em).join("");
    const htmlMidia = window.renderMidiaOuLinkFB(p);
    const htmlComentarios = (p.comentarios || []).map(c => `<div style="margin-bottom:8px;"><div class="comment-bubble"><strong onclick="window.abrirPerfilPorNome('${c.autor.replace(/'/g, "\\'")}')" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" style="cursor:pointer;color:#050505;">${c.autor}:</strong> ${c.texto}</div><div class="comment-meta"><span style="color:${c.liked ? "#E30613" : "#65676b"}" onclick="curtirComentario(${p.id}, ${c.id})">👍 Curtir ${c.likes > 0 ? `(${c.likes})` : ""}</span><span onclick="responderComentario(${p.id}, ${c.id})">Responder</span></div>${(c.respostas || []).length ? `<div class="reply-list">${c.respostas.map(r => `<div style="margin-bottom:4px;"><div class="comment-bubble" style="background:#e9ebee;"><strong onclick="window.abrirPerfilPorNome('${r.autor.replace(/'/g, "\\'")}')" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" style="cursor:pointer;color:#050505;">${r.autor}:</strong> ${r.texto}</div></div>`).join("")}</div>` : ""}</div>`).join("");
    return `<div class="social-card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;position:relative;">${window.getAvatarUsuarioCMS(p.autorEmail, p.autor, p.iniciais, 38, "#002454")}<div><strong onclick="window.abrirPerfilPorNome('${p.autor.replace(/'/g, "\\'")}')" onmouseenter="window.mostrarHoverCardPerfil(event, '${p.autor.replace(/'/g, "\\'")}')" onmouseleave="window.esconderHoverCardPerfil()" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" style="color:#002454;font-size:14px;display:block;cursor:pointer;">${p.autor}</strong><span style="font-size:12px;color:#65676b;">${window.formatarDataPostFB(p)}</span></div><button type="button" onclick="window.toggleMenuPostFB(event, ${p.id})" title="Mais opções" style="margin-left:auto;width:34px;height:34px;border-radius:50%;border:none;background:transparent;color:#65676b;font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='transparent'">•••</button></div>${p.texto ? `<p style="font-size:14px;line-height:1.45;margin-bottom:6px;">${window.linkificarTextoFB(p.texto)}</p>` : ""}${p.tempo ? `<div class="solve-badge"><strong style="font-size:18px;color:#002454;">⏱️ ${p.tempo}</strong> <span style="font-size:12px;color:#E30613;font-weight:bold;">(${p.mod})</span>${p.scramble ? `<div style="font-family:monospace;font-size:12px;color:#555;margin-top:4px;">Scramble: ${p.scramble}</div>` : ""}</div>` : ""}${htmlMidia}<div style="display:flex;justify-content:space-between;font-size:12px;color:#65676b;margin-top:10px;padding-bottom:6px;"><span>${emojisAtivos} ${totalReacoes > 0 ? totalReacoes + " reações" : "Seja o primeiro a reagir"}</span><span>${(p.comentarios || []).length} comentários</span></div><div class="social-actions" style="margin-top:0;"><div class="reaction-wrapper"><div class="reaction-bar">${["👍","❤️","🔥","🤯","👏"].map(em => `<button type="button" class="react-emoji" onclick="reagirPost(${p.id}, '${em}')">${em}</button>`).join("")}</div><button type="button" class="btn-social-gray" style="width:100%;color:${p.minhaReacao ? "#E30613" : "#002454"}" onclick="reagirPost(${p.id}, '👍')">${p.minhaReacao || "👍"} ${p.minhaReacao ? "Reagiu" : "Curtir"}</button></div><button type="button" class="btn-social-gray" style="flex:1;margin-left:8px;" onclick="document.getElementById('inp-com-${p.id}').focus()">💬 Comentar</button></div><div style="margin-top:12px;padding-top:10px;border-top:1px solid #eee;">${htmlComentarios}<form onsubmit="comentarFeed(${p.id}, event)" style="display:flex;gap:8px;margin-top:6px;"><input type="text" id="inp-com-${p.id}" placeholder="Escreva um comentário..." style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:8px 14px;font-size:13px;outline:none;"><button type="submit" class="btn-social-red" style="padding:6px 14px;font-size:12px;">Enviar</button></form></div></div>`;
  }).join("") : `<div class="social-card" style="text-align:center;padding:32px;color:#65676b;"><div style="font-size:15px;font-weight:700;margin-bottom:8px;">Nenhuma publicação encontrada neste filtro.</div><button type="button" onclick="window.setFiltroFeedCMS('todos')" style="padding:8px 16px;border:none;border-radius:18px;background:#1877f2;color:#fff;font-weight:700;cursor:pointer;">Ver todas as publicações</button></div>`;
  box.innerHTML = barraFiltrosHtml + cardsHtml;
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

window.sincronizarAvataresDOM = function() {
  const s = JSON.parse(localStorage.getItem("cms_s") || "null") || { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
  const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
  const foto = perfis[s.e]?.avatar || Object.values(perfis).find(x => x && x.avatar)?.avatar || "";
  if (!foto) return;
  document.querySelectorAll(".fb-nav-right button, .fb-nav-right div, .fb-left div, .social-card div").forEach(el => {
    if (el.children.length === 0 && /^(JE|JF)$/i.test(el.textContent.trim())) {
      const w = el.offsetWidth || 38;
      const h = el.offsetHeight || 38;
      el.innerHTML = `<img src="${foto}" style="width:${w}px;height:${h}px;border-radius:50%;object-fit:cover;display:block;">`;
      el.style.background = "transparent";
      el.style.padding = "0";
      el.style.overflow = "hidden";
    }
  });
};
setInterval(window.sincronizarAvataresDOM, 800);
document.addEventListener("DOMContentLoaded", window.sincronizarAvataresDOM);


(function() {
  const timersVis = new WeakMap();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
        if (!timersVis.has(el)) {
          const t = setTimeout(() => {
            timersVis.delete(el);
            if (!document.body.contains(el)) return;
            const ytId = el.getAttribute("data-yt-auto");
            if (ytId && window.tocarUnicoVideoFeed) {
              window.tocarUnicoVideoFeed(el, ytId, true);
            } else if (el.tagName === "VIDEO") {
              document.querySelectorAll("video").forEach(v => { if (v !== el) v.pause(); });
              document.querySelectorAll(".cms-yt-active-box").forEach(box => {
                const oldId = box.getAttribute("data-vid");
                if (oldId && window.gerarCapaYoutubeHTML) box.outerHTML = window.gerarCapaYoutubeHTML(oldId);
              });
              el.muted = true;
              el.play().catch(() => {});
            }
          }, 3000);
          timersVis.set(el, t);
        }
      } else {
        if (timersVis.has(el)) {
          clearTimeout(timersVis.get(el));
          timersVis.delete(el);
        }
        if (el.classList && el.classList.contains("cms-yt-active-box")) {
          const oldId = el.getAttribute("data-vid");
          if (oldId && window.gerarCapaYoutubeHTML) el.outerHTML = window.gerarCapaYoutubeHTML(oldId);
        } else if (el.tagName === "VIDEO" && !el.paused) {
          el.pause();
        }
      }
    });
  }, { threshold: [0, 0.65] });

  setInterval(() => {
    document.querySelectorAll("[data-yt-auto], .cms-yt-active-box, video.post-media").forEach(el => {
      if (!el.dataset.obsBound) {
        el.dataset.obsBound = "1";
        obs.observe(el);
      }
    });
  }, 1200);
})();
