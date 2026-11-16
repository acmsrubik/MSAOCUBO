(function() {
  const KEY = "cms_stories_v1";
  let audioEl = null, timerSt = null, liveStream = null;
  const FILTROS = [
    { n: "Normal", c: "none" },
    { n: "Vívido", c: "contrast(1.25) saturate(1.4)" },
    { n: "P&B", c: "grayscale(1) contrast(1.15)" },
    { n: "Sépia", c: "sepia(0.85)" },
    { n: "Retrô", c: "sepia(0.35) saturate(1.5) hue-rotate(-15deg)" },
    { n: "Frio", c: "hue-rotate(180deg) saturate(1.2)" },
    { n: "Brilho+", c: "brightness(1.22) contrast(1.1)" }
  ];

  function getStories() {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    const ok = arr.filter(s => s.criadoEm > Date.now() - 86400000);
    if (ok.length !== arr.length) localStorage.setItem(KEY, JSON.stringify(ok));
    return ok;
  }

  function saveStories(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  window.renderBarraStories = function() {
    const alvo = document.querySelector("#tab-feed .feed-box") || document.querySelector("#feed-texto")?.closest(".social-card")?.parentElement;
    if (!alvo) return;
    let bar = document.getElementById("fb-stories-strip");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "fb-stories-strip";
      alvo.insertBefore(bar, alvo.firstChild);
    }
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const foto = perfis[eu.e]?.avatar || Object.values(perfis).find(x => x && x.avatar)?.avatar || "";
    const lista = getStories();

    const gruposMap = new Map();
    lista.forEach((st, idxOriginal) => {
      const chave = st.autorEmail || st.autor;
      if (!gruposMap.has(chave)) gruposMap.set(chave, []);
      gruposMap.get(chave).push({ ...st, idxOriginal });
    });
    window._gruposStories = Array.from(gruposMap.values());

    const cards = window._gruposStories.map((grupo, gIdx) => {
      const st = grupo.at(0);
      const qtd = grupo.length;
      const av = perfis[st.autorEmail]?.avatar || foto;
      const mid = st.tipo === "texto" || !st.midia
        ? `<div style="width:100%;height:100%;background:${st.fundoCor||'linear-gradient(135deg,#1877f2,#002454)'};display:flex;align-items:center;justify-content:center;padding:10px;text-align:center;color:${st.textoCor||'#fff'};font-weight:800;font-size:13px;">${st.textoOverlay || st.sticker || "🎵"}</div>`
        : (st.tipo === "video"
          ? `<video src="${st.midia}" muted style="width:100%;height:100%;object-fit:cover;filter:${st.filtro||'none'};"></video>`
          : `<img src="${st.midia}" style="width:100%;height:100%;object-fit:cover;filter:${st.filtro||'none'};background:${st.fundoCor||'#111'};">`);
      return `<div onclick="window.verGrupoStory(${gIdx}, 0)" style="position:relative;min-width:116px;width:116px;height:198px;border-radius:12px;overflow:hidden;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.2);flex-shrink:0;background:#111;">
        ${mid}
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.25),transparent 45%,rgba(0,0,0,0.75));"></div>
        ${qtd > 1 ? `<span style="position:absolute;top:8px;right:8px;background:#1877f2;color:#fff;font-size:11px;font-weight:800;padding:2px 7px;border-radius:10px;border:1px solid #fff;">${qtd}</span>` : ""}
        <div style="position:absolute;top:8px;left:8px;width:34px;height:34px;border-radius:50%;border:3px solid #1877f2;overflow:hidden;background:#002454;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">
          ${av ? `<img src="${av}" style="width:100%;height:100%;object-fit:cover;">` : (st.autor||"CM").slice(0,2).toUpperCase()}
        </div>
        <div style="position:absolute;bottom:8px;left:8px;right:8px;color:#fff;font-size:12px;font-weight:700;line-height:1.2;">
          ${st.autor}
          ${st.musica ? `<div style="font-size:10px;font-weight:400;opacity:0.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🎵 ${st.musica.titulo}</div>` : ""}
        </div>
      </div>`;
    }).join("");

    bar.innerHTML = `<div style="display:flex;gap:10px;overflow-x:auto;padding:2px 2px 14px;margin-bottom:4px;">
      <div onclick="window.abrirCriadorStory('midia')" style="position:relative;min-width:116px;width:116px;height:198px;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.16);flex-shrink:0;display:flex;flex-direction:column;cursor:pointer;">
        <div style="height:140px;background:#e4e6eb;overflow:hidden;">
          ${foto ? `<img src="${foto}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;">${eu.n.slice(0,2).toUpperCase()}</div>`}
        </div>
        <div style="position:absolute;top:122px;left:50%;transform:translateX(-50%);width:34px;height:34px;border-radius:50%;background:#1877f2;border:4px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;">+</div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding-top:14px;">
          <span style="font-size:13px;font-weight:700;color:#050505;text-align:center;">Criar story</span>
        </div>
      </div>${localStorage.getItem("cms_live_ativa") ? `<div onclick="window.assistirLiveFB()" style="position:relative;min-width:116px;width:116px;height:198px;border-radius:12px;overflow:hidden;cursor:pointer;border:3px solid #e41e3f;background:#111;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;"><span style="background:#e41e3f;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;margin-bottom:8px;">🔴 AO VIVO</span><strong style="font-size:12px;text-align:center;padding:0 6px;">Assistir Live Agora</strong></div>` : ""}${cards}</div>`;
  };

  function pararAudio() {
    if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; audioEl = null; }
    const yt = document.getElementById("cms-yt-music-player");
    if (yt) yt.remove();
    clearTimeout(timerSt);
  }

  window.tocarAudioTrecho = function(url, inicioSeg, fimSeg) {
    pararAudio();
    fecharCamRapidaStory();
    if (!url) return;
    const ini = Number(inicioSeg) || 0;
    const fim = Math.min(45, Math.max(ini + 3, Number(fimSeg) || 30));
    audioEl = new Audio(url);
    audioEl.volume = 1.0;
    audioEl.addEventListener("loadedmetadata", () => {
      if (ini < audioEl.duration) audioEl.currentTime = ini;
    });
    audioEl.ontimeupdate = () => {
      if (audioEl && audioEl.currentTime >= fim) {
        audioEl.currentTime = ini;
      }
    };
    audioEl.play().catch(() => {});
  };

  window.fecharStory = function() {
    pararAudio();
    const el = document.getElementById("fb-story-viewer");
    if (el) el.remove();
  };

  window.apagarStory = function(i) {
    const arr = getStories();
    arr.splice(i, 1);
    saveStories(arr);
    window.fecharStory();
    window.renderBarraStories();
  };

  window.formatarHoraStory = function(ts) {
    if (!ts) return "Agora";
    const d = new Date(ts);
    const hoje = new Date();
    const hora = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === hoje.toDateString()) return "Hoje às " + hora;
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + " às " + hora;
  };

  window.curtirStory = function(idxOriginal, emoji, gIdx, sIdx) {
    const arr = getStories();
    if (!arr[idxOriginal]) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { e: "jefferson@cubomagicoms.com.br" };
    if (!arr[idxOriginal].reacoesMap || typeof arr[idxOriginal].reacoesMap !== "object") {
      arr[idxOriginal].reacoesMap = {};
    }
    if (arr[idxOriginal].reacoesMap[eu.e] === emoji) {
      delete arr[idxOriginal].reacoesMap[eu.e];
    } else {
      arr[idxOriginal].reacoesMap[eu.e] = emoji; if (window.registrarNotificacaoCMS) window.registrarNotificacaoCMS((eu.n || "Alguém") + " reagiu com " + emoji + " ao story de " + arr[idxOriginal].autor, emoji, "");
    }
    arr[idxOriginal].likes = Object.values(arr[idxOriginal].reacoesMap);
    saveStories(arr);
    window.renderBarraStories();
    const listaLikes = arr[idxOriginal].likes;
    const badge = document.getElementById("st-likes-count");
    if (badge) badge.textContent = listaLikes.length ? listaLikes.slice(-4).join(" ") + " (" + listaLikes.length + ")" : "Curtir";
  };

  window.responderStoryFB = function(e, autor, autorEmail) {
    e.preventDefault();
    const inp = document.getElementById("st-reply-inp");
    const txt = inp?.value.trim();
    if (!txt) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const msgs = JSON.parse(localStorage.getItem("cms_msgs_v1") || "[]");
    msgs.push({ id: Date.now(), de: eu.e, deNome: eu.n, para: autorEmail, texto: `💬 Respondeu ao story: "${txt}"`, hora: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) });
    localStorage.setItem("cms_msgs_v1", JSON.stringify(msgs)); if (window.registrarNotificacaoCMS) window.registrarNotificacaoCMS(eu.n + " respondeu ao story de " + autor + ": \"" + txt + "\"", "💬", "messenger");
    inp.value = "";
    const toast = document.getElementById("st-reply-toast");
    if (toast) { toast.style.display = "block"; setTimeout(() => toast.style.display = "none", 2200); }
  };

  window.alternarSomStory = function() {
    if (!audioEl) return;
    audioEl.muted = !audioEl.muted;
    const btn = document.getElementById("st-mute-btn");
    if (btn) btn.textContent = audioEl.muted ? "🔇" : "🔊";
  };

  window.verGrupoStory = function(gIdx, sIdx) {
    const grupos = window._gruposStories || [];
    const grupo = grupos[gIdx];
    if (!grupo || !grupo[sIdx]) {
      if (sIdx >= (grupo?.length || 0) && gIdx + 1 < grupos.length) return window.verGrupoStory(gIdx + 1, 0);
      if (sIdx < 0 && gIdx - 1 >= 0) return window.verGrupoStory(gIdx - 1, grupos[gIdx - 1].length - 1);
      window.fecharStory();
      return;
    }
    const st = grupo[sIdx];
    window.fecharStory();
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const tf = `scale(${st.zoom || 1}) rotate(${st.rot || 0}deg)`;
    const duracaoMs = st.musica ? Math.min(45, Math.max(10, (st.musica.fim || 30) - (st.musica.inicio || 0))) * 1000 : 15000;
    const listaLateral = grupos.map((g, idxG) => {
      const ult = g.at(-1);
      const avG = perfis[ult.autorEmail]?.avatar || "";
      return `<div onclick="window.verGrupoStory(${idxG}, 0)" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;background:${idxG === gIdx ? '#e7f3ff' : 'transparent'};">
        <div style="width:50px;height:50px;border-radius:50%;padding:2px;border:3px solid #1877f2;flex-shrink:0;">
          ${avG ? `<img src="${avG}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<div style="width:100%;height:100%;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;">${(ult.autor||"CM").slice(0,2).toUpperCase()}</div>`}
        </div>
        <div><div style="font-weight:700;font-size:14px;color:#050505;">${ult.autor}</div><div style="font-size:12px;color:#1877f2;font-weight:600;">${window.formatarHoraStory(ult.criadoEm)}</div></div>
      </div>`;
    }).join("");

    const barras = grupo.map((_, idx) => `<div style="flex:1;height:3px;background:rgba(255,255,255,0.35);border-radius:3px;overflow:hidden;"><div id="st-bar-${idx}" style="width:${idx < sIdx ? '100%' : '0%'};height:100%;background:#fff;transition:${idx === sIdx ? 'width ' + (duracaoMs/1000) + 's linear' : 'none'};"></div></div>`).join("");
    const mid = st.tipo === "texto" || !st.midia
      ? `<div style="width:270px;height:480px;background:${st.fundoCor||'linear-gradient(135deg,#1877f2,#002454)'};"></div>`
      : (st.tipo === "video"
        ? `<video src="${st.midia}" autoplay playsinline style="width:270px;height:480px;object-fit:contain;filter:${st.filtro||'none'};transform:${tf};"></video>`
        : `<img src="${st.midia}" style="width:270px;height:480px;object-fit:contain;filter:${st.filtro||'none'};transform:${tf};">`);
    const v = document.createElement("div");
    v.id = "fb-story-viewer";
    v.style.cssText = "position:fixed;inset:0;background:#000;z-index:999999;display:grid;grid-template-columns:340px 1fr;font-family:inherit;";
    v.innerHTML = `
      <div style="background:#fff;border-right:1px solid #dddfe2;display:flex;flex-direction:column;height:100vh;padding:12px 16px;box-sizing:border-box;">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid #e4e6eb;">
          <button onclick="window.fecharStory()" style="width:36px;height:36px;border-radius:50%;border:none;background:#e4e6eb;font-size:18px;font-weight:bold;cursor:pointer;">✕</button>
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:13px;">CMS</div>
        </div>
        <h2 style="margin:14px 0 10px;font-size:22px;font-weight:800;">Stories</h2>
        <div onclick="window.fecharStory();window.abrirCriadorStory('midia')" style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:10px;cursor:pointer;margin-bottom:14px;background:#f0f2f5;">
          <div style="width:46px;height:46px;border-radius:50%;background:#fff;color:#1877f2;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">+</div>
          <div><div style="font-weight:700;font-size:14px;">Criar um story</div><div style="font-size:12px;color:#65676b;">Compartilhe foto, vídeo ou música</div></div>
        </div>
        <div style="font-size:14px;font-weight:700;margin-bottom:6px;">Todos os stories</div>
        <div style="overflow-y:auto;flex:1;">${listaLateral}</div>
      </div>
      <div style="position:relative;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:14px;box-sizing:border-box;">
        <button onclick="window.verGrupoStory(${gIdx}, ${sIdx - 1})" style="position:absolute;left:28px;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);color:#fff;font-size:22px;cursor:pointer;z-index:30;">‹</button>
        <button onclick="window.verGrupoStory(${gIdx}, ${sIdx + 1})" style="position:absolute;right:28px;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);color:#fff;font-size:22px;cursor:pointer;z-index:30;">›</button>
        <div style="position:relative;width:270px;height:480px;aspect-ratio:9/16;background:${st.fundoCor||'#111'};border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;gap:4px;z-index:20;">${barras}</div>
          <div style="position:absolute;top:22px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;z-index:20;color:#fff;">
            <div style="min-width:0;"><div style="font-size:12px;font-weight:700;text-shadow:0 1px 3px #000;">${st.autor} <span style="font-weight:400;opacity:0.85;">${window.formatarHoraStory(st.criadoEm)}</span></div>${st.musica ? `<div style="font-size:10px;opacity:0.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🎵 ${st.musica.titulo}</div>` : ""}</div>
            <div style="display:flex;gap:5px;">
              ${st.musica?.previewUrl ? `<button id="st-mute-btn" onclick="window.alternarSomStory()" style="background:rgba(0,0,0,0.55);color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;">🔊</button>` : ""}
              ${st.autorEmail === eu.e ? `<button onclick="window.apagarStory(${st.idxOriginal})" style="background:rgba(220,38,38,0.85);color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;">🗑️</button>` : ""}
            </div>
          </div>
          ${mid}
          ${st.horaOverlay ? `<div style="position:absolute;top:${st.hrY||12}%;left:${st.hrX||72}%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.65);color:#fff;padding:4px 10px;border-radius:12px;font-size:13px;font-weight:800;">🕒 ${st.horaOverlay}</div>` : ""}
          ${st.textoOverlay ? `<div style="position:absolute;top:${st.txtY||50}%;left:${st.txtX||50}%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:${st.textoCor||'#fff'};padding:6px 14px;border-radius:8px;font-size:17px;font-weight:800;">${st.textoOverlay}</div>` : ""}
          ${st.sticker ? `<div style="position:absolute;top:${st.stkY||82}%;left:${st.stkX||78}%;transform:translate(-50%,-50%);font-size:40px;">${st.sticker}</div>` : ""}
          <div id="st-reply-toast" style="display:none;position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:#1877f2;color:#fff;padding:5px 12px;border-radius:16px;font-size:11px;font-weight:700;z-index:30;">✓ Mensagem enviada!</div>
        </div>
        <div style="width:100%;max-width:540px;display:flex;align-items:center;gap:10px;margin-top:14px;">
          <form onsubmit="window.responderStoryFB(event,'${(st.autor||'').replace(/'/g,"\'")}','${st.autorEmail||''}')" style="flex:1;display:flex;">
            <input id="st-reply-inp" onfocus="clearTimeout(timerSt)" placeholder="Enviar mensagem..." style="width:100%;background:transparent;border:1px solid rgba(255,255,255,0.45);border-radius:22px;padding:9px 16px;color:#fff;font-size:14px;outline:none;">
          </form>
          <div style="display:flex;gap:6px;align-items:center;">
            ${["👍","❤️","🥰","😂","😮","😢","😡"].map(em => `<button type="button" onclick="window.curtirStory(${st.idxOriginal},'${em}',${gIdx},${sIdx})" style="background:none;border:none;font-size:23px;cursor:pointer;padding:0;">${em}</button>`).join("")}
            <span id="st-likes-count" style="color:#fff;font-size:12px;font-weight:700;margin-left:4px;">${(st.likes||[]).length ? (st.likes||[]).slice(-3).join("") + " " + (st.likes||[]).length : ""}</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(v);
    setTimeout(() => { const b = document.getElementById("st-bar-" + sIdx); if (b) b.style.width = "100%"; }, 40);
    if (st.musica?.previewUrl) { window.tocarAudioTrecho(st.musica.previewUrl, st.musica.inicio || 0, st.musica.fim || 30); }
    timerSt = setTimeout(() => window.verGrupoStory(gIdx, sIdx + 1), duracaoMs);
  };

  let camStoryStream = null, camStoryRec = null, camStoryChunks = [];

  window.abrirCameraRapidaStory = async function() {
    try {
      camStoryStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
      return alert("Permita o acesso à câmera e microfone no navegador.");
    }
    const prev = document.getElementById("st-prev");
    if (!prev) return;
    prev.innerHTML = `
      <video id="st-cam-vid" autoplay muted playsinline style="width:270px;height:480px;object-fit:cover;"></video>
      <div style="position:absolute;bottom:14px;left:10px;right:10px;display:flex;gap:8px;justify-content:center;z-index:25;">
        <button type="button" onclick="window.capturarFotoCamStory()" style="background:#fff;color:#050505;border:none;border-radius:20px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">📸 Foto</button>
        <button id="btn-rec-cam-st" type="button" onclick="window.alternarGravacaoCamStory()" style="background:#e41e3f;color:#fff;border:none;border-radius:20px;padding:8px 14px;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">⏺️ Gravar Vídeo</button>
      </div>
    `;
    document.getElementById("st-cam-vid").srcObject = camStoryStream;
  };

  function fecharCamRapidaStory() {
    if (camStoryStream) { camStoryStream.getTracks().forEach(t => t.stop()); camStoryStream = null; }
  }

  window.capturarFotoCamStory = function() {
    const vid = document.getElementById("st-cam-vid");
    if (!vid) return;
    const c = document.createElement("canvas");
    c.width = vid.videoWidth || 540;
    c.height = vid.videoHeight || 960;
    c.getContext("2d").drawImage(vid, 0, 0, c.width, c.height);
    window._storyEd.midia = c.toDataURL("image/jpeg", 0.9);
    window._storyEd.tipo = "imagem";
    fecharCamRapidaStory();
    window.atualizarPrevStory();
  };

  window.alternarGravacaoCamStory = function() {
    const btn = document.getElementById("btn-rec-cam-st");
    if (!camStoryRec || camStoryRec.state === "inactive") {
      camStoryChunks = [];
      camStoryRec = new MediaRecorder(camStoryStream, { mimeType: "video/webm" });
      camStoryRec.ondataavailable = (e) => { if (e.data.size > 0) camStoryChunks.push(e.data); };
      camStoryRec.onstop = () => {
        const blob = new Blob(camStoryChunks, { type: "video/webm" });
        const reader = new FileReader();
        reader.onload = (ev) => {
          window._storyEd.midia = ev.target.result;
          window._storyEd.tipo = "video";
          fecharCamRapidaStory();
          window.atualizarPrevStory();
        };
        reader.readAsDataURL(blob);
      };
      camStoryRec.start();
      if (btn) btn.textContent = "⏹️ Parar Gravação";
    } else {
      camStoryRec.stop();
    }
  };

  window.fecharCriadorStory = function() {
    pararAudio();
    if (liveStream) { liveStream.getTracks().forEach(t => t.stop()); liveStream = null; }
    const el = document.getElementById("fb-story-creator");
    if (el) el.remove();
  };

  window.iniciarArrastoStory = function(e, tipo) {
    e.preventDefault();
    const box = document.getElementById("st-prev");
    const el = e.currentTarget;
    if (!box || !el) return;
    const rect = box.getBoundingClientRect();
    const mover = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      let px = Math.round(((clientX - rect.left) / rect.width) * 100);
      let py = Math.round(((clientY - rect.top) / rect.height) * 100);
      px = Math.max(8, Math.min(92, px));
      py = Math.max(6, Math.min(94, py));
      el.style.left = px + "%";
      el.style.top = py + "%";
      if (tipo === "texto") { window._storyEd.txtX = px; window._storyEd.txtY = py; }
      if (tipo === "sticker") { window._storyEd.stkX = px; window._storyEd.stkY = py; }
      if (tipo === "hora") { window._storyEd.hrX = px; window._storyEd.hrY = py; }
    };
    const parar = () => {
      document.removeEventListener("mousemove", mover);
      document.removeEventListener("mouseup", parar);
      document.removeEventListener("touchmove", mover);
      document.removeEventListener("touchend", parar);
    };
    document.addEventListener("mousemove", mover);
    document.addEventListener("mouseup", parar);
    document.addEventListener("touchmove", mover, { passive: false });
    document.addEventListener("touchend", parar);
  };

  window.atualizarPrevStory = function() {
    const p = document.getElementById("st-prev");
    if (!p) return;
    p.style.background = window._storyEd.fundoCor;
    const tf = `scale(${window._storyEd.zoom || 1}) rotate(${window._storyEd.rot || 0}deg)`;
    if (window._storyEd.isLive) {
      p.innerHTML = `<video id="st-live-vid" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;filter:${window._storyEd.filtro};transform:${tf};"></video><span style="position:absolute;top:10px;left:10px;background:#e41e3f;color:#fff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;">🔴 AO VIVO</span>`;
      const vid = document.getElementById("st-live-vid");
      if (vid && liveStream) vid.srcObject = liveStream;
    } else if (window._storyEd.midia) {
      p.innerHTML = window._storyEd.tipo === "video"
        ? `<video src="${window._storyEd.midia}" autoplay loop muted playsinline style="width:270px;height:480px;object-fit:contain;filter:${window._storyEd.filtro};transform:${tf};transition:0.15s;"></video>`
        : `<img src="${window._storyEd.midia}" style="width:270px;height:480px;object-fit:contain;filter:${window._storyEd.filtro};transform:${tf};transition:0.15s;">`;
    } else {
      p.innerHTML = `<div style="color:rgba(255,255,255,0.85);text-align:center;padding:20px;font-size:13px;">Escolha <b>Foto / Vídeo</b> ou clique em <b>Aa Adicionar texto</b></div>`;
    }
    if (window._storyEd.horaOverlay) p.innerHTML += `<div onmousedown="window.iniciarArrastoStory(event,'hora')" ontouchstart="window.iniciarArrastoStory(event,'hora')" title="Arraste para mover" style="position:absolute;top:${window._storyEd.hrY||12}%;left:${window._storyEd.hrX||72}%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.65);color:#fff;padding:4px 10px;border-radius:12px;font-weight:800;font-size:13px;cursor:grab;user-select:none;z-index:20;">🕒 ${window._storyEd.horaOverlay}</div>`;
    if (window._storyEd.textoOverlay) p.innerHTML += `<div onmousedown="window.iniciarArrastoStory(event,'texto')" ontouchstart="window.iniciarArrastoStory(event,'texto')" title="Arraste para mover o texto" style="position:absolute;top:${window._storyEd.txtY||50}%;left:${window._storyEd.txtX||50}%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.65);color:${window._storyEd.textoCor};padding:6px 14px;border-radius:8px;font-weight:800;font-size:17px;cursor:grab;user-select:none;z-index:20;white-space:nowrap;">${window._storyEd.textoOverlay}</div>`;
    if (window._storyEd.sticker) p.innerHTML += `<div onmousedown="window.iniciarArrastoStory(event,'sticker')" ontouchstart="window.iniciarArrastoStory(event,'sticker')" title="Arraste para mover o sticker" style="position:absolute;top:${window._storyEd.stkY||82}%;left:${window._storyEd.stkX||78}%;transform:translate(-50%,-50%);font-size:40px;cursor:grab;user-select:none;z-index:20;">${window._storyEd.sticker}</div>`;
  };

  window.buscarMusicaStory = async function() {
    const q = document.getElementById("st-mus-q")?.value.trim();
    const box = document.getElementById("st-mus-res");
    if (!q || !box) return;
    box.innerHTML = `<div style="padding:6px;font-size:12px;">Buscando "${q}"...</div>`;
    try {
      const res = await fetch("/api/musicas?q=" + encodeURIComponent(q));
      const data = await res.json();
      window._musicasTmp = data.results || [];
      box.innerHTML = window._musicasTmp.map((m, idx) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px;border-bottom:1px solid #eee;font-size:12px;">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:185px;"><strong>${m.trackName}</strong> - ${m.artistName}</div>
        <div style="display:flex;gap:4px;">
          <button type="button" onclick="window.tocarPrevMus(${idx})" style="border:none;background:#e4e6eb;border-radius:4px;padding:3px 7px;cursor:pointer;">▶️</button>
          <button type="button" onclick="window.escolherMus(${idx})" style="border:none;background:#1877f2;color:#fff;border-radius:4px;padding:3px 7px;cursor:pointer;">Usar</button>
        </div>
      </div>`).join("") || `<div style="padding:6px;font-size:12px;">Nenhuma música encontrada.</div>`;
    } catch (e) {
      box.innerHTML = `<div style="padding:6px;font-size:12px;color:red;">Inicie o servidor com: python3 server_stories.py</div>`;
    }
  };

  window.tocarPrevMus = function(idx) {
    const m = (window._musicasTmp || [])[idx];
    if (!m?.previewUrl) return;
    window.tocarAudioTrecho(m.previewUrl, 0);
  };

  window.atualizarCorteMusica = function() {
    const m = window._storyEd.musica;
    if (!m) return;
    let ini = Number(document.getElementById("st-mus-ini")?.value || 0);
    let fim = Number(document.getElementById("st-mus-fim")?.value || 30);
    if (fim <= ini) fim = Math.min(45, ini + 5);
    if (fim - ini > 45) fim = ini + 45;
    m.inicio = ini;
    m.fim = fim;
    const lbl = document.getElementById("st-mus-seg-lbl");
    if (lbl) lbl.textContent = `0:${String(ini).padStart(2,'0')} até 0:${String(fim).padStart(2,'0')} (${fim - ini}s)`;
    window.tocarAudioTrecho(m.previewUrl, ini, fim);
  };

  window.escolherMus = function(idx) {
    const m = (window._musicasTmp || [])[idx];
    if (!m) return;
    window._storyEd.musica = { titulo: m.trackName, artista: m.artistName, previewUrl: m.previewUrl, inicio: 0, fim: 30 };
    window.tocarAudioTrecho(m.previewUrl, 0, 30);
    document.getElementById("st-mus-sel").innerHTML = `
      <div style="background:#fff;border:1px solid #ccd0d5;border-radius:8px;padding:8px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
          <span>🎵 <strong>${m.trackName}</strong></span>
          <button type="button" onclick="pararAudio();window._storyEd.musica=null;this.closest('div').parentElement.innerHTML=''" style="border:none;background:none;color:#dc2626;font-weight:bold;cursor:pointer;">✕</button>
        </div>
        <div style="margin-top:6px;font-size:11px;color:#65676b;">
          <div style="display:flex;justify-content:space-between;"><span>Trecho (máx 45s):</span><strong id="st-mus-seg-lbl">0:00 até 0:30 (30s)</strong></div>
          <label style="display:block;margin-top:4px;">Início: <input id="st-mus-ini" type="range" min="0" max="25" value="0" onchange="window.atualizarCorteMusica()" style="width:78%;vertical-align:middle;"></label>
          <label style="display:block;margin-top:2px;">Fim: <input id="st-mus-fim" type="range" min="5" max="45" value="30" onchange="window.atualizarCorteMusica()" style="width:82%;vertical-align:middle;"></label>
        </div>
      </div>`;
  };

  window.removerFundoStory = function() {
    if (!window._storyEd.midia || window._storyEd.tipo !== "imagem") return alert("Carregue uma foto primeiro!");
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const d = id.data, r0 = d, g0 = d, b0 = d;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.hypot(d[i]-r0, d[i+1]-g0, d[i+2]-b0) < 58 || (d[i]>225 && d[i+1]>225 && d[i+2]>225)) d[i+3] = 0;
      }
      ctx.putImageData(id, 0, 0);
      window._storyEd.midia = c.toDataURL("image/png");
      window.atualizarPrevStory();
    };
    img.src = window._storyEd.midia;
  };

  window.iniciarLiveSt = async function() {
    try {
      liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      window._storyEd.isLive = true; window._storyEd.tipo = "video";
      window.atualizarPrevStory();
    } catch (e) { alert("Permita câmera e microfone no navegador para Live."); }
  };

  window.uploadMidiaSt = function(inp) {
    const f = inp.files && inp.files[0];
    if (!f) return;
    window._storyEd.isLive = false;
    window._storyEd.tipo = f.type.startsWith("video") ? "video" : "imagem";
    const r = new FileReader();
    r.onload = (e) => { window._storyEd.midia = e.target.result; window.atualizarPrevStory(); };
    r.readAsDataURL(f);
  };

  window.publicarStory = function() {
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    if (window._storyEd.isLive) {
      const vid = document.getElementById("st-live-vid");
      if (vid) {
        const c = document.createElement("canvas");
        c.width = vid.videoWidth || 480; c.height = vid.videoHeight || 640;
        c.getContext("2d").drawImage(vid, 0, 0, c.width, c.height);
        window._storyEd.midia = c.toDataURL("image/jpeg", 0.85); window._storyEd.tipo = "imagem";
      }
    }
    if (!window._storyEd.midia && !window._storyEd.textoOverlay && !window._storyEd.sticker && !window._storyEd.musica) return alert("Digite um texto ou escolha uma foto/vídeo!");
    if (!window._storyEd.midia) window._storyEd.tipo = "texto";
    const arr = getStories();
    arr.push({ id: Date.now(), criadoEm: Date.now(), autor: eu.n, autorEmail: eu.e, ...window._storyEd });
    saveStories(arr);
    window.fecharCriadorStory();
    window.renderBarraStories();
  };

  window.toggleSecaoStory = function(id) {
    ["sec-st-texto","sec-st-musica","sec-st-filtros"].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = (s === id && el.style.display === "none") ? "block" : "none";
    });
  };

  window.alternarHoraStory = function() {
    if (window._storyEd.horaOverlay) window._storyEd.horaOverlay = "";
    else { const d = new Date(); window._storyEd.horaOverlay = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); }
    window.atualizarPrevStory();
  };

  window.abrirCriadorStory = function(modo) {
    window.fecharCriadorStory();
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const foto = perfis[eu.e]?.avatar || Object.values(perfis).find(x => x && x.avatar)?.avatar || "";
    window._storyEd = { tipo: "imagem", midia: "", filtro: "none", musica: null, textoOverlay: "", textoCor: "#ffffff", horaOverlay: "", sticker: "", fundoCor: "linear-gradient(180deg,#8c6d62,#b91c1c)", zoom: 1, rot: 0, isLive: modo === "live" };
    const m = document.createElement("div");
    m.id = "fb-story-creator";
    m.style.cssText = "position:fixed;inset:0;background:#f0f2f5;z-index:999999;display:grid;grid-template-columns:340px 1fr;font-family:inherit;";
    m.innerHTML = `
      <div style="background:#fff;border-right:1px solid #dddfe2;display:flex;flex-direction:column;height:100vh;">
        <div style="padding:12px 16px;border-bottom:1px solid #e4e6eb;display:flex;align-items:center;gap:10px;">
          <button onclick="window.fecharCriadorStory()" style="width:36px;height:36px;border-radius:50%;border:none;background:#e4e6eb;font-size:18px;font-weight:bold;cursor:pointer;">✕</button>
          <div style="width:36px;height:36px;border-radius:50%;background:#1877f2;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:13px;">CMS</div>
        </div>
        <div style="padding:14px 16px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:8px;">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;">Seu story</h2>
          <div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid #e4e6eb;">
            ${foto ? `<img src="${foto}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">` : `<div style="width:44px;height:44px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;">${eu.n.slice(0,2).toUpperCase()}</div>`}
            <strong style="font-size:15px;">${eu.n}</strong>
          </div>
          <label style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;cursor:pointer;background:#e7f3ff;color:#1877f2;font-weight:700;font-size:14px;">
            <span style="width:34px;height:34px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;">📷</span>
            Escolher Foto ou Vídeo
            <input type="file" accept="image/*,video/*" onchange="window.uploadMidiaSt(this)" style="display:none;">
          </label>
                    <button type="button" onclick="window.abrirCameraRapidaStory()" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;">📸</span>Tirar foto ou gravar vídeo</button>
          <button type="button" onclick="window.fecharCriadorStory();window.iniciarTransmissaoLiveFB()" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;">🔴</span>Fazer live</button>
          <button type="button" onclick="window.toggleSecaoStory('sec-st-texto')" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;font-weight:900;">Aa</span>Adicionar texto</button>
          <div id="sec-st-texto" style="display:none;background:#f0f2f5;padding:10px;border-radius:8px;">
            <div style="display:flex;gap:6px;"><input oninput="window._storyEd.textoOverlay=this.value;window.atualizarPrevStory()" placeholder="Digite o texto..." style="flex:1;padding:7px;border:1px solid #ccc;border-radius:6px;"><input type="color" value="#ffffff" onchange="window._storyEd.textoCor=this.value;window.atualizarPrevStory()" style="width:34px;height:32px;border:none;"></div>
            <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;">${["🧊","⏱️","🏆","🔥","🇧🇷","🥇",""].map(s => `<button type="button" onclick="window._storyEd.sticker='${s}';window.atualizarPrevStory()" style="padding:3px 7px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;">${s||"✕"}</button>`).join("")}</div>
          </div>
          <button type="button" onclick="window.toggleSecaoStory('sec-st-musica')" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;">🎵</span>Adicionar música</button>
          <div id="sec-st-musica" style="display:none;background:#f0f2f5;padding:10px;border-radius:8px;">
            <div id="st-mus-sel" style="color:#1877f2;font-size:12px;margin-bottom:4px;"></div>
            <div style="display:flex;gap:5px;"><input id="st-mus-q" placeholder="Pesquisar música..." style="flex:1;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:12px;"><button type="button" onclick="window.buscarMusicaStory()" style="background:#1877f2;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Buscar</button></div>
            <div id="st-mus-res" style="max-height:110px;overflow-y:auto;margin-top:5px;"></div>
          </div>
          <button type="button" onclick="window.alternarHoraStory()" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;">🕒</span>Adicionar hora</button>
          <button type="button" onclick="window.removerFundoStory()" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;">✨</span>Remover fundo da foto</button>
          <button type="button" onclick="window.toggleSecaoStory('sec-st-filtros')" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:14px;text-align:left;"><span style="width:34px;height:34px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;">🎨</span>Filtros e fundo</button>
          <div id="sec-st-filtros" style="display:none;background:#f0f2f5;padding:10px;border-radius:8px;">
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">${FILTROS.map(f => `<button type="button" onclick="window._storyEd.filtro='${f.c}';window.atualizarPrevStory()" style="padding:4px 7px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:11px;">${f.n}</button>`).join("")}</div>
            <div style="display:flex;gap:6px;">${["linear-gradient(180deg,#8c6d62,#b91c1c)","linear-gradient(135deg,#1877f2,#002454)","linear-gradient(135deg,#10b981,#047857)","#111827","#ffffff"].map(bg => `<button type="button" onclick="window._storyEd.fundoCor='${bg}';window.atualizarPrevStory()" style="width:24px;height:24px;border-radius:50%;border:2px solid #ccc;background:${bg};cursor:pointer;"></button>`).join("")}</div>
          </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid #e4e6eb;display:flex;gap:10px;background:#fff;">
          <button type="button" onclick="window.fecharCriadorStory()" style="flex:1;padding:10px;border:none;border-radius:6px;background:#e4e6eb;color:#050505;font-weight:700;font-size:14px;cursor:pointer;">Descartar</button>
          <button type="button" onclick="window.publicarStory()" style="flex:1.4;padding:10px;border:none;border-radius:6px;background:#1877f2;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">Compartilhar no story</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;padding:20px;overflow:hidden;">
        <div style="background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.1);flex:1;display:flex;flex-direction:column;">
          <strong style="font-size:15px;color:#050505;margin-bottom:10px;">Prévia</strong>
          <div style="flex:1;background:#18191a;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px;">
            <div id="st-prev" style="position:relative;width:270px;height:480px;aspect-ratio:9/16;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;"></div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;color:#fff;">
              <span style="font-size:18px;font-weight:bold;">−</span>
              <input type="range" min="0.5" max="2" step="0.05" value="1" oninput="window._storyEd.zoom=this.value;window.atualizarPrevStory()" style="width:180px;cursor:pointer;">
              <span style="font-size:18px;font-weight:bold;">+</span>
              <button type="button" onclick="window._storyEd.rot=((window._storyEd.rot||0)+90)%360;window.atualizarPrevStory()" style="background:#fff;color:#050505;border:none;border-radius:6px;padding:6px 12px;font-weight:700;font-size:13px;cursor:pointer;margin-left:8px;">↻ Girar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    window.atualizarPrevStory();
    
  };

  setInterval(window.renderBarraStories, 1500);
  document.addEventListener("DOMContentLoaded", window.renderBarraStories);
})();
