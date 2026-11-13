const WCA_COMP_API = "https:" + "//www.worldcubeassociation." + "org/api/v0/competitions";
const NOMES_EV = { "333":"3x3x3","222":"2x2x2","444":"4x4x4","555":"5x5x5","666":"6x6x6","777":"7x7x7","333bf":"3x3 Vendado","333fm":"FMC","333oh":"3x3 Uma Mão","clock":"Clock","minx":"Megaminx","pyram":"Pyraminx","skewb":"Skewb","sq1":"Square-1","444bf":"4x4 Vendado","555bf":"5x5 Vendado","333mbf":"Multi-Blind" };

function formatarDataPt(iniStr, fimStr) {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const p1 = (iniStr || "").split("-"), p2 = (fimStr || iniStr || "").split("-");
  if (p1.length < 3) return iniStr;
  const m1 = meses[parseInt(p1.at(1), 10) - 1], d1 = parseInt(p1.at(2), 10), a1 = p1.at(0);
  const m2 = meses[parseInt(p2.at(1), 10) - 1], d2 = parseInt(p2.at(2), 10), a2 = p2.at(0);
  if (iniStr === fimStr) return `${m1} ${d1}, ${a1}`;
  if (m1 === m2 && a1 === a2) return `${m1} ${d1} – ${d2}, ${a1}`;
  return `${m1} ${d1} – ${m2} ${d2}, ${a2}`;
}

async function carregarProximasCompeticoes() {
  const box = document.getElementById("proximas-comps");
  try {
    const hoje = new Date(), daqui30 = new Date();
    daqui30.setDate(hoje.getDate() + 30);
    const ini = hoje.toISOString().split("T").at(0), fim = daqui30.toISOString().split("T").at(0);
    const r = await fetch(`${WCA_COMP_API}?country_iso2=BR&start=${ini}&end=${fim}&sort=start_date`);
    const lista = await r.json();
    const ativas = (Array.isArray(lista) ? lista : []).filter(c => !c.cancelled_at);

    if (!ativas.length) {
      box.innerHTML = "<p>Nenhuma competição oficial agendada no Brasil para os próximos 30 dias.</p>";
      return;
    }

    box.innerHTML = `<div class="comp-grid">${ativas.map(c => {
      const evs = c.event_ids || [];
      const evPrincipal = evs.includes("333") ? "3x3x3" : (NOMES_EV[evs.at(0)] || evs.at(0) || "Não informado");
      const dataPt = formatarDataPt(c.start_date, c.end_date);
      const orgOficial = c.organizers?.find(o => !o.wca_id && o.avatar && !o.avatar.is_default);
      const logoOrg = orgOficial ? (orgOficial.avatar.url || orgOficial.avatar.thumb_url) : "";
      return `
        <article class="comp-card">
          <div>
            <div class="comp-head">
              <div style="flex:1;">
                <span class="comp-data">${dataPt}</span>
                <h4 class="comp-title">${c.name}</h4>
              </div>
              <img id="logo-${c.id}" src="${logoOrg}" alt="" class="comp-logo" style="${logoOrg ? '' : 'display:none;'}" onerror="this.style.display='none'">
            </div>
            <p class="comp-city"><strong>Local:</strong> ${c.city}</p>
            <p class="comp-city"><strong>Limite:</strong> ${c.competitor_limit || "—"} competidores</p>
            <p class="comp-city"><strong>Evento principal:</strong> <span class="ev-tag">${evPrincipal}</span></p>
          </div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <a href="${c.url}/register" target="_blank" class="btn-inscrever" style="flex:1;">INSCREVER-SE</a>
            <a href="${c.url}" target="_blank" class="btn-inscrever" style="background:#002454;">DETALHES</a>
          </div>
        </article>`;
    }).join("")}</div>`;

    ativas.forEach(async c => {
      try {
        const det = await (await fetch(`${WCA_COMP_API}/${c.id}`)).json();
        const orgs = (det.organizers || []).filter(o => !o.wca_id && o.avatar && !o.avatar.is_default);
        const info = det.information || "";
        const todasImgs = [...info.matchAll(/!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)/gi)].map(m => ({ alt: m.at(1).toLowerCase(), url: m.at(2) }));
        const validas = todasImgs.filter(x => !/flag|bandeira|emoji|twemoji|brasil|brazil|whatsapp|instagram|pix/.test(x.alt + x.url.toLowerCase()));
        const imgLogo = validas.find(x => /logo|escudo|cubo|open|show|championship|brasileiro/.test(x.alt + x.url.toLowerCase())) || validas.at(0);
        const urlFinal = imgLogo?.url || orgs.at(-1)?.avatar?.url || orgs.at(0)?.avatar?.url;
        if (urlFinal) {
          const teste = new Image();
          teste.onload = () => {
            if (teste.width >= 40 && teste.height >= 40) {
              const el = document.getElementById(`logo-${c.id}`);
              if (el) { el.src = urlFinal; el.style.display = "block"; }
            }
          };
          teste.src = urlFinal;
        }
      } catch {}
    });
  } catch (e) {
    box.innerHTML = `<p style="color:#E30613;">Erro ao carregar calendário oficial da WCA: ${e.message}</p>`;
  }
}

async function carregarNoticias() {
  const box = document.getElementById("lista-noticias");
  try {
    const r = await fetch("noticias.json?t=" + Date.now());
    const noticias = await r.json();
    if (!noticias.length) { box.innerHTML = "<p>Nenhuma notícia publicada ainda.</p>"; return; }
    box.innerHTML = `<div class="news-grid">${noticias.map(n => `
      <article class="news-card">
        <div class="news-meta">${n.categoria || "NOTÍCIA"} • ${n.data}</div>
        <h4>${n.titulo}</h4>
        <p>${n.resumo}</p>
      </article>`).join("")}</div>`;
  } catch { box.innerHTML = "<p>Não foi possível carregar as notícias no momento.</p>"; }
}

carregarProximasCompeticoes();
carregarNoticias();
