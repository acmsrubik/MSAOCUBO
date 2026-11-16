(function() {
  window.abrirGeradorDivulgacao = function(opts = {}) {
    document.getElementById("fb-share-generator")?.remove();
    const eu = window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS() : { n: "Jefferson Feitosa Almeida", e: "jefferson@cubomagicoms.com.br" };
    const perfis = JSON.parse(localStorage.getItem("cms_perfis_v1") || "{}");
    const meuP = perfis[eu.e] || {};
    const wcaId = meuP.wcaId || "2024ALME13";
    const recs = meuP.wcaData?.recordes || {};

    const tituloCard = opts.titulo || eu.n;
    const subtituloCard = opts.subtitulo || `Cubista Oficial • WCA ID: ${wcaId}`;
    const destaqueCard = opts.destaque || (recs["333"]?.single?.best ? `3x3x3 Single: ${(recs["333"].single.best / 100).toFixed(2)}s` : "Comunidade Global de Speedcubing");
    const urlBase = window.location.origin + window.location.pathname;
    const linkConvite = `${urlBase}?convite=${encodeURIComponent(wcaId || eu.n)}`;

    const m = document.createElement("div");
    m.id = "fb-share-generator";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit;";
    m.innerHTML = `
      <div style="background:#fff;width:100%;max-width:520px;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px;max-height:94vh;overflow-y:auto;box-shadow:0 12px 36px rgba(0,0,0,0.35);">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4e6eb;padding-bottom:10px;">
          <h3 style="margin:0;font-size:18px;font-weight:800;color:#050505;">🚀 Gerador de Link & Card de Divulgação</h3>
          <button type="button" onclick="document.getElementById('fb-share-generator').remove()" style="width:30px;height:30px;border-radius:50%;border:none;background:#e4e6eb;font-weight:bold;cursor:pointer;">✕</button>
        </div>

        <div style="display:flex;gap:6px;">
          <button type="button" onclick="window.desenharCardDivulgacao('azul')" style="flex:1;padding:7px;border:none;border-radius:8px;background:#1877f2;color:#fff;font-weight:700;font-size:12px;cursor:pointer;">Tema Oficial Azul</button>
          <button type="button" onclick="window.desenharCardDivulgacao('escuro')" style="flex:1;padding:7px;border:none;border-radius:8px;background:#111827;color:#fff;font-weight:700;font-size:12px;cursor:pointer;">Tema Pro Dark</button>
          <button type="button" onclick="window.desenharCardDivulgacao('brasil')" style="flex:1;padding:7px;border:none;border-radius:8px;background:#047857;color:#fff;font-weight:700;font-size:12px;cursor:pointer;">Tema Brasil</button>
        </div>

        <div style="background:#f0f2f5;padding:12px;border-radius:12px;display:flex;justify-content:center;">
          <canvas id="cms-share-canvas" width="900" height="500" style="width:100%;max-width:460px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.2);"></canvas>
        </div>

        <div>
          <label style="font-size:12px;font-weight:700;color:#65676b;">Seu Link Global de Convite & Divulgação:</label>
          <div style="display:flex;gap:6px;margin-top:4px;">
            <input id="cms-share-url" readonly value="${linkConvite}" style="flex:1;background:#f0f2f5;border:1px solid #dddfe2;border-radius:8px;padding:8px 10px;font-size:12px;color:#050505;">
            <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('cms-share-url').value);this.textContent='✓ Copiado!';setTimeout(()=>this.textContent='📋 Copiar',1800);" style="background:#e4e6eb;color:#050505;border:none;border-radius:8px;padding:0 12px;font-weight:700;font-size:12px;cursor:pointer;">📋 Copiar</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button type="button" onclick="window.baixarCardDivulgacao()" style="padding:11px;background:#1877f2;color:#fff;border:none;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;">⬇️ Baixar Card (PNG)</button>
          <a href="https://wa.me{encodeURIComponent('🧊 Venha para a rede social global MS AO CUBO! ' + destaqueCard + ' 👉 ' + linkConvite)}" target="_blank" style="padding:11px;background:#25d366;color:#fff;border-radius:8px;font-weight:800;font-size:13px;text-decoration:none;text-align:center;">🟢 Enviar no WhatsApp</a>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    window._shareDataAtual = { tituloCard, subtituloCard, destaqueCard, avatar: meuP.avatar || "", wcaId };
    window.desenharCardDivulgacao("azul");
  };

  window.desenharCardDivulgacao = function(tema = "azul") {
    const c = document.getElementById("cms-share-canvas");
    if (!c) return;
    const ctx = c.getContext("2d");
    const d = window._shareDataAtual || {};

    const grad = ctx.createLinearGradient(0, 0, 900, 500);
    if (tema === "escuro") {
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#1e293b");
    } else if (tema === "brasil") {
      grad.addColorStop(0, "#064e3b");
      grad.addColorStop(0.6, "#047857");
      grad.addColorStop(1, "#d97706");
    } else {
      grad.addColorStop(0, "#002454");
      grad.addColorStop(0.55, "#1877f2");
      grad.addColorStop(1, "#0ea5e9");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 500);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(820, 90, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px sans-serif";
    ctx.fillText("🧊 MS AO CUBO • GLOBAL SPEEDCUBING", 48, 65);

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(48, 90, 804, 2);

    const desenharTextos = () => {
      const xTxt = d.avatar ? 230 : 48;
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 38px sans-serif";
      ctx.fillText((d.tituloCard || "Cubista Oficial").slice(0, 28), xTxt, 185);

      ctx.fillStyle = "#e0f2fe";
      ctx.font = "600 22px sans-serif";
      ctx.fillText(d.subtituloCard || "", xTxt, 225);

      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.beginPath();
      ctx.roundRect(48, 290, 804, 92, 16);
      ctx.fill();

      ctx.fillStyle = "#facc15";
      ctx.font = "800 30px sans-serif";
      ctx.fillText("🏆 " + (d.destaqueCard || ""), 74, 347);

      ctx.fillStyle = "#ffffff";
      ctx.font = "600 18px sans-serif";
      ctx.fillText("Conecte-se, acompanhe resultados WCA e negocie cubos • cubomagicoms.com.br", 48, 448);
    };

    if (d.avatar) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 195, 76, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 49, 119, 152, 152);
        ctx.restore();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(125, 195, 76, 0, Math.PI * 2);
        ctx.stroke();
        desenharTextos();
      };
      img.onerror = desenharTextos;
      img.src = d.avatar;
    } else {
      desenharTextos();
    }
  };

  window.baixarCardDivulgacao = function() {
    const c = document.getElementById("cms-share-canvas");
    if (!c) return;
    const link = document.createElement("a");
    link.download = "card-msaocubo.png";
    link.href = c.toDataURL("image/png");
    link.click();
  };
})();
