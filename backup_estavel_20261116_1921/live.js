(function() {
  let mediaRec = null, streamLive = null, liveIdAtivo = "", timerLive = null, segsLive = 0, chatPoll = null, micMudo = false, estaNoAr = false;

  function pararTudoLive() {
    estaNoAr = false;
    clearInterval(timerLive);
    clearInterval(chatPoll);
    if (mediaRec && mediaRec.state !== "inactive") mediaRec.stop();
    if (streamLive) { streamLive.getTracks().forEach(t => t.stop()); streamLive = null; }
  }

  window.fecharEstudioLive = function() {
    if (estaNoAr) return window.encerrarLiveFB();
    pararTudoLive();
    const el = document.getElementById("fb-live-broadcaster");
    if (el) el.remove();
  };

  window.iniciarTransmissaoLiveFB = async function() {
    if (document.getElementById("fb-live-broadcaster")) return;
    try {
      streamLive = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
      return alert("Permita o acesso à câmera e microfone no navegador para preparar a Live!");
    }
    segsLive = 0; micMudo = false; estaNoAr = false;

    const modal = document.createElement("div");
    modal.id = "fb-live-broadcaster";
    modal.style.cssText = "position:fixed;inset:0;background:#111;z-index:999999;display:grid;grid-template-columns:350px 1fr;font-family:inherit;color:#fff;";
    modal.innerHTML = `
      <div style="background:#fff;color:#050505;padding:16px;display:flex;flex-direction:column;height:100vh;box-sizing:border-box;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #e4e6eb;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="live-status-pill" style="background:#65676b;color:#fff;font-weight:800;font-size:11px;padding:4px 8px;border-radius:6px;">⚙️ PREPARAÇÃO</span>
            <strong style="font-size:16px;">Estúdio ao Vivo</strong>
          </div>
          <button onclick="window.fecharEstudioLive()" style="width:32px;height:32px;border-radius:50%;border:none;background:#e4e6eb;font-weight:bold;cursor:pointer;">✕</button>
        </div>

        <div style="margin-top:14px;">
          <label style="font-size:12px;font-weight:700;color:#65676b;">Título da transmissão:</label>
          <div style="display:flex;gap:6px;margin-top:4px;">
            <input id="live-titulo-inp" value="Treinando Cubo Mágico ao vivo!" oninput="window.atualizarTituloLive()" style="flex:1;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;">
          <button type="button" id="btn-live-mic" onclick="window.alternarMicLive()" style="flex:1;padding:9px;border:1px solid #ccc;border-radius:8px;background:#f0f2f5;font-weight:700;cursor:pointer;">🎤 Mic Ativo</button>
        </div>

        <div id="live-chat-wrapper" style="display:none;margin-top:14px;flex:1;flex-direction:column;min-height:0;">
          <strong style="font-size:13px;margin-bottom:6px;">💬 Chat ao vivo</strong>
          <div id="live-host-chat" style="flex:1;overflow-y:auto;background:#f0f2f5;border-radius:8px;padding:8px;font-size:12px;display:flex;flex-direction:column;gap:6px;"></div>
        </div>

        <div id="live-prep-tip" style="margin-top:14px;background:#e7f3ff;color:#1877f2;padding:10px 12px;border-radius:8px;font-size:12px;line-height:1.4;">
          <strong>Você ainda não está no ar.</strong> Ajuste sua câmera, confira o áudio e o título. Quando estiver pronto, clique no botão abaixo para iniciar.
        </div>

        <div style="margin-top:auto;padding-top:12px;">
          <button id="btn-go-live" type="button" onclick="window.comecarTransmissaoReal()" style="width:100%;padding:12px;background:#1877f2;color:#fff;border:none;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">🔴 Iniciar transmissão ao vivo</button>
          <button id="btn-stop-live" type="button" onclick="window.encerrarLiveFB()" style="display:none;width:100%;padding:12px;background:#dc2626;color:#fff;border:none;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">⏹️ Encerrar Vídeo ao Vivo</button>
        </div>
      </div>

      <div style="position:relative;display:flex;align-items:center;justify-content:center;background:#000;">
        <div style="position:relative;width:290px;height:515px;border-radius:16px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,0.8);background:#000;">
          <video id="live-host-video" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>
          <div style="position:absolute;top:12px;left:12px;display:flex;gap:6px;align-items:center;">
            <span id="live-video-badge" style="background:rgba(0,0,0,0.65);color:#fff;font-weight:800;font-size:11px;padding:3px 8px;border-radius:6px;">PRÉVIA</span>
            <span id="live-timer-lbl" style="display:none;background:rgba(0,0,0,0.65);padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;">00:00</span>
          </div>
          <div id="live-countdown" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.55);align-items:center;justify-content:center;font-size:72px;font-weight:900;color:#fff;">3</div>
          <div id="live-pinned-banner" style="position:absolute;bottom:14px;left:12px;right:12px;background:rgba(0,0,0,0.7);padding:8px 12px;border-radius:10px;font-size:12px;font-weight:700;">📌 Treinando Cubo Mágico ao vivo!</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("live-host-video").srcObject = streamLive;
  };

  window.comecarTransmissaoReal = function() {
    const btnGo = document.getElementById("btn-go-live");
    if (btnGo) btnGo.disabled = true;
    const cd = document.getElementById("live-countdown");
    let n = 3;
    if (cd) { cd.style.display = "flex"; cd.textContent = n; }
    const iv = setInterval(async () => {
      n--;
      if (n > 0) {
        if (cd) cd.textContent = n;
      } else {
        clearInterval(iv);
        if (cd) cd.style.display = "none";
        estaNoAr = true;
        const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson", e: "jefferson@cubomagicoms.com.br" };
        const titulo = document.getElementById("live-titulo-inp")?.value.trim() || "Ao vivo no MS AO CUBO!";
        liveIdAtivo = "live" + Date.now();
        localStorage.setItem("cms_live_ativa", JSON.stringify({ id: liveIdAtivo, autor: eu.n, autorEmail: eu.e, titulo, iniciadaEm: Date.now(), ativa: true }));

        document.getElementById("live-status-pill").style.background = "#e41e3f";
        document.getElementById("live-status-pill").textContent = "🔴 AO VIVO";
        document.getElementById("live-video-badge").style.background = "#e41e3f";
        document.getElementById("live-video-badge").textContent = "AO VIVO";
        document.getElementById("live-timer-lbl").style.display = "inline-block";
        document.getElementById("live-prep-tip").style.display = "none";
        document.getElementById("live-chat-wrapper").style.display = "flex";
        document.getElementById("btn-go-live").style.display = "none";
        document.getElementById("btn-stop-live").style.display = "block";

        await fetch("/api/live/chunk?reset=1&id=" + liveIdAtivo, { method: "POST", body: new Blob([]) });
        mediaRec = new MediaRecorder(streamLive, { mimeType: "video/webm" });
        mediaRec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0 && liveIdAtivo) {
            fetch("/api/live/chunk?id=" + liveIdAtivo, { method: "POST", body: ev.data }).catch(() => {});
          }
        };
        mediaRec.start(2000);

        timerLive = setInterval(() => {
          segsLive++;
          const m = String(Math.floor(segsLive / 60)).padStart(2, "0");
          const s = String(segsLive % 60).padStart(2, "0");
          const el = document.getElementById("live-timer-lbl");
          if (el) el.textContent = `${m}:${s}`;
        }, 1000);

        chatPoll = setInterval(async () => {
          try {
            const res = await (await fetch("/api/live/chat?id=" + liveIdAtivo)).json();
            const box = document.getElementById("live-host-chat");
            if (box) box.innerHTML = (res.msgs || []).map(x => `<div style="background:#fff;padding:6px 8px;border-radius:6px;"><strong>${x.autor}:</strong> ${x.texto}</div>`).join("") || `<span style="color:#65676b;">Aguardando comentários...</span>`;
          } catch (e) {}
        }, 2000);
      }
    }, 1000);
  };

  window.atualizarTituloLive = function() {
    const t = document.getElementById("live-titulo-inp")?.value.trim();
    const b = document.getElementById("live-pinned-banner");
    if (b) b.textContent = "📌 " + (t || "Ao vivo!");
    const info = JSON.parse(localStorage.getItem("cms_live_ativa") || "null");
    if (info) { info.titulo = t; localStorage.setItem("cms_live_ativa", JSON.stringify(info)); }
  };

  window.alternarMicLive = function() {
    if (!streamLive) return;
    micMudo = !micMudo;
    streamLive.getAudioTracks().forEach(t => t.enabled = !micMudo);
    const btn = document.getElementById("btn-live-mic");
    if (btn) btn.textContent = micMudo ? "🔇 Mic Mudo" : "🎤 Mic Ativo";
  };

  window.encerrarLiveFB = function() {
    const info = JSON.parse(localStorage.getItem("cms_live_ativa") || "null");
    const salvarReplay = confirm("Live encerrada! Deseja publicar o Replay nos seus Stories?");
    pararTudoLive();
    localStorage.removeItem("cms_live_ativa");
    const el = document.getElementById("fb-live-broadcaster");
    if (el) el.remove();
    if (salvarReplay && info) {
      const arr = JSON.parse(localStorage.getItem("cms_stories_v1") || "[]");
      arr.push({ id: Date.now(), criadoEm: Date.now(), autor: info.autor, autorEmail: info.autorEmail, tipo: "video", midia: "/api/live/video?id=" + info.id, textoOverlay: "🔴 REPLAY: " + info.titulo, isLive: true });
      localStorage.setItem("cms_stories_v1", JSON.stringify(arr));
    }
    if (window.renderBarraStories) window.renderBarraStories();
  };

  window.assistirLiveFB = function() {
    const info = JSON.parse(localStorage.getItem("cms_live_ativa") || "null");
    if (!info) return alert("Esta transmissão ao vivo já foi encerrada.");
    const v = document.createElement("div");
    v.id = "fb-live-viewer";
    v.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.94);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;color:#fff;font-family:inherit;";
    v.innerHTML = `<div style="position:relative;width:300px;height:530px;background:#111;border-radius:16px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,0.8);display:flex;flex-direction:column;">
      <div style="position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;z-index:20;">
        <div style="display:flex;align-items:center;gap:6px;"><span style="background:#e41e3f;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;">🔴 AO VIVO</span><strong style="font-size:12px;">${info.autor}</strong></div>
        <button onclick="clearInterval(window._vLivePoll);this.closest('#fb-live-viewer').remove()" style="background:rgba(255,255,255,0.2);color:#fff;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">✕</button>
      </div>
      <video src="/api/live/video?id=${info.id}&t=${Date.now()}" autoplay controls playsinline style="width:100%;height:100%;object-fit:cover;"></video>
      <div id="live-viewer-chat" style="position:absolute;bottom:56px;left:10px;right:10px;max-height:140px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;font-size:12px;z-index:20;"></div>
      <form onsubmit="window.enviarChatLiveFB(event,'${info.id}')" style="position:absolute;bottom:10px;left:10px;right:10px;display:flex;gap:6px;z-index:20;">
        <input id="live-chat-inp" placeholder="Comentar ao vivo..." style="flex:1;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.4);border-radius:20px;padding:7px 12px;color:#fff;font-size:12px;outline:none;">
        <button type="button" onclick="window.reagirLiveFB('❤️')" style="background:none;border:none;font-size:20px;cursor:pointer;">❤️</button>
        <button type="button" onclick="window.reagirLiveFB('🔥')" style="background:none;border:none;font-size:20px;cursor:pointer;">🔥</button>
      </form>
    </div>`;
    document.body.appendChild(v);
    window._vLivePoll = setInterval(async () => {
      try {
        const res = await (await fetch("/api/live/chat?id=" + info.id)).json();
        const box = document.getElementById("live-viewer-chat");
        if (box) box.innerHTML = (res.msgs || []).slice(-6).map(x => `<div style="background:rgba(0,0,0,0.55);padding:4px 8px;border-radius:8px;"><strong>${x.autor}:</strong> ${x.texto}</div>`).join("");
      } catch (e) {}
    }, 2000);
  };

  window.enviarChatLiveFB = async function(e, lid) {
    e.preventDefault();
    const inp = document.getElementById("live-chat-inp");
    const txt = inp?.value.trim();
    if (!txt) return;
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson" };
    inp.value = "";
    await fetch("/api/live/chat?id=" + lid, { method: "POST", body: JSON.stringify({ autor: eu.n, texto: txt }) });
  };

  window.reagirLiveFB = function(em) {
    const v = document.getElementById("fb-live-viewer");
    if (!v) return;
    const fl = document.createElement("div");
    fl.textContent = em;
    fl.style.cssText = "position:absolute;bottom:60px;right:24px;font-size:28px;transition:all 1.5s ease-out;z-index:30;pointer-events:none;";
    v.firstElementChild.appendChild(fl);
    setTimeout(() => { fl.style.bottom = "320px"; fl.style.opacity = "0"; }, 30);
    setTimeout(() => fl.remove(), 1600);
  };
})();
