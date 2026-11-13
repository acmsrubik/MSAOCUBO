const ESTADOS_INFO = {
  AC:["Acre","Norte",1,2], AL:["Alagoas","Nordeste",7,3], AP:["Amapá","Norte",4,0],
  AM:["Amazonas","Norte",2,1], BA:["Bahia","Nordeste",6,4], CE:["Ceará","Nordeste",6,1],
  DF:["Distrito Federal","Centro-Oeste",4,3], ES:["Espírito Santo","Sudeste",6,5],
  GO:["Goiás","Centro-Oeste",4,4], MA:["Maranhão","Nordeste",5,1], MT:["Mato Grosso","Centro-Oeste",3,3],
  MS:["Mato Grosso do Sul","Centro-Oeste",3,5], MG:["Minas Gerais","Sudeste",5,5],
  PA:["Pará","Norte",4,1], PB:["Paraíba","Nordeste",7,2], PR:["Paraná","Sul",4,6],
  PE:["Pernambuco","Nordeste",6,2], PI:["Piauí","Nordeste",5,2], RJ:["Rio de Janeiro","Sudeste",6,6],
  RN:["Rio Grande do Norte","Nordeste",7,1], RS:["Rio Grande do Sul","Sul",3,8],
  RO:["Rondônia","Norte",2,3], RR:["Roraima","Norte",2,0], SC:["Santa Catarina","Sul",4,7],
  SP:["São Paulo","Sudeste",5,6], SE:["Sergipe","Nordeste",7,4], TO:["Tocantins","Norte",4,2]
};
const REGIOES_ORD = ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"];
const CORES_REG = { "Sudeste": "#002454", "Sul": "#E30613", "Nordeste": "#0284c7", "Centro-Oeste": "#d97706", "Norte": "#059669" };
const MESES_PT = ["Todos os meses","Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).style.display = "block";
    const tab = btn.dataset.tab;
    const isDash = tab === "tab-dashboard";
    const titulos = {
      "tab-inicio": ["CALENDÁRIO OFICIAL & NOTÍCIAS DO CUBO MÁGICO", "Confira as competições oficiais no Brasil nos próximos 30 dias e acompanhe as últimas novidades."],
      "tab-rankings": ["TABELA DE CLASSIFICAÇÃO & RECORDES MUNDIAIS", "Acompanhe os tempos oficiais e pesquise o histórico competitivo de qualquer cubista registrado."],
      "tab-dashboard": ["DASHBOARD NACIONAL DE COMPETIÇÕES WCA", "Análise geográfica e histórica das competições oficiais realizadas no Brasil."]
    };
    document.getElementById("hero-titulo").textContent = titulos[tab].at(0);
    document.getElementById("hero-sub").textContent = titulos[tab].at(1);
    if (isDash && !window.dashIniciado) iniciarDashboard();
  });
});
let baseDash = null, geoBrasil = null, chartsDash = {}, ufSelecionada = "SP";
async function carregarBaseDash() {
  const root = document.getElementById("dashboard-root");
  root.innerHTML = "<p style='padding:20px;font-weight:bold;'>Carregando dados oficiais...</p>";
  try {
    const r = await fetch("competicoes_br.json?t=" + Date.now());
    baseDash = await r.json();
    if (!geoBrasil) geoBrasil = await (await fetch("brasil_mapa.json")).json();
    montarLayoutDash();
  } catch (e) {
    root.innerHTML = `<p style="color:#E30613;padding:20px;font-weight:bold;">Erro: ${e.message}</p>`;
  }
}
function iniciarDashboard() { window.dashIniciado = true; carregarBaseDash(); }
function montarLayoutDash() {
  const anos = [...new Set(baseDash.competicoes.map(c => c.ano))].sort((a, b) => b - a);
  const optsAnos = anos.map(a => `<option value="${a}">${a}</option>`).join("");
  const optsUfs = Object.entries(ESTADOS_INFO).sort((a, b) => a.at(1).at(0).localeCompare(b.at(1).at(0))).map(([uf, info]) => `<option value="${uf}">${info.at(0)} (${uf})</option>`).join("");
  document.getElementById("dashboard-root").innerHTML = `
    <div class="dash-topbar">
      <span><strong>FONTE OFICIAL:</strong> World Cube Association (WCA) • Última atualização: <strong>${baseDash.atualizado_em || "Não disponível"}</strong></span>
      <button class="btn-refresh" id="btn-atualizar-dash">RECARREGAR DADOS</button>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card accent"><div class="kpi-title">Total de Competições (Brasil)</div><div class="kpi-val" id="kpi-total">0</div><div class="kpi-sub">Eventos oficiais filtrados</div></div>
      <div class="kpi-card"><div class="kpi-title">Região Líder</div><div class="kpi-val" id="kpi-regiao">—</div><div class="kpi-sub" id="kpi-regiao-sub">—</div></div>
      <div class="kpi-card"><div class="kpi-title">Estado Líder</div><div class="kpi-val" id="kpi-estado">—</div><div class="kpi-sub" id="kpi-estado-sub">—</div></div>
      <div class="kpi-card"><div class="kpi-title">Média por Região</div><div class="kpi-val" id="kpi-media">0</div><div class="kpi-sub">Competições por região</div></div>
    </div>
    <div class="dash-filters">
      <label>PERÍODO / ANO INICIAL<select id="f-ano-ini"><option value="todos">Histórico Completo</option>${optsAnos}</select></label>
      <label>ATÉ O ANO (INTERVALO)<select id="f-ano-fim"><option value="todos">Até o mais recente</option>${optsAnos}</select></label>
      <label>MÊS<select id="f-mes">${MESES_PT.map((m, i) => `<option value="${i}">${m}</option>`).join("")}</select></label>
      <label>REGIÃO<select id="f-regiao"><option value="todas">Todas as Regiões</option>${REGIOES_ORD.map(r => `<option value="${r}">${r}</option>`).join("")}</select></label>
      <label>ESTADO (UF)<select id="f-uf"><option value="todos">Todos os 27 Estados</option>${optsUfs}</select></label>
      <label>ORDENAÇÃO<select id="f-ordem"><option value="desc">Maior para Menor</option><option value="asc">Menor para Maior</option></select></label>
    </div>
    <div class="dash-grid-2">
      <div class="fa-card"><div class="fa-card-header"><h3>COMPETIÇÕES POR REGIÃO BRASILEIRA</h3></div><div class="chart-wrap"><canvas id="chart-regioes"></canvas></div></div>
      <div class="fa-card"><div class="fa-card-header"><h3>EVOLUÇÃO HISTÓRICA POR REGIÃO</h3></div><div class="reg-checks" id="checks-regioes">${REGIOES_ORD.map(r => `<label><input type="checkbox" value="${r}" checked> ${r}</label>`).join("")}</div><div class="chart-wrap"><canvas id="chart-evolucao"></canvas></div></div>
    </div>
    <div class="fa-card">
      <div class="fa-card-header"><h3>RANKING DOS 27 ESTADOS BRASILEIROS (INCLUINDO DF)</h3></div>
      <div class="podium-bar" id="podium-estados"></div>
      <div class="chart-wrap-tall"><canvas id="chart-estados"></canvas></div>
    </div>
    <div class="fa-card">
      <div class="fa-card-header"><h3>MAPA INTERATIVO DO BRASIL POR ESTADO</h3></div>
      <div class="mapa-layout">
        <div id="mapa-svg-box"></div>
        <div class="uf-detail-box" id="uf-detalhes">Clique em qualquer estado no mapa para ver os detalhes oficiais.</div>
      </div>
    </div>`;
  document.getElementById("btn-atualizar-dash").addEventListener("click", carregarBaseDash);
  ["f-ano-ini","f-ano-fim","f-mes","f-regiao","f-uf","f-ordem"].forEach(id => document.getElementById(id).addEventListener("change", atualizarDashboard));
  document.querySelectorAll("#checks-regioes input").forEach(chk => chk.addEventListener("change", atualizarDashboard));
  atualizarDashboard();
}
function atualizarDashboard() {
  const anoIni = document.getElementById("f-ano-ini").value;
  const anoFim = document.getElementById("f-ano-fim").value;
  const mes = parseInt(document.getElementById("f-mes").value);
  const reg = document.getElementById("f-regiao").value;
  const uf = document.getElementById("f-uf").value;
  const ordem = document.getElementById("f-ordem").value;

  const filtradas = baseDash.competicoes.filter(c => {
    if (anoIni !== "todos" && anoFim === "todos" && c.ano !== parseInt(anoIni)) return false;
    if (anoIni !== "todos" && anoFim !== "todos" && (c.ano < Math.min(anoIni, anoFim) || c.ano > Math.max(anoIni, anoFim))) return false;
    if (anoIni === "todos" && anoFim !== "todos" && c.ano > parseInt(anoFim)) return false;
    if (mes > 0 && c.mes !== mes) return false;
    if (reg !== "todas" && c.regiao !== reg) return false;
    if (uf !== "todos" && c.uf !== uf) return false;
    return true;
  });

  const total = filtradas.length;
  const porReg = Object.fromEntries(REGIOES_ORD.map(r => [r, 0]));
  const porUf = Object.fromEntries(Object.keys(ESTADOS_INFO).map(k => [k, 0]));
  filtradas.forEach(c => { porReg[c.regiao]++; porUf[c.uf]++; });

  const regOrd = Object.entries(porReg).sort((a, b) => ordem === "desc" ? b.at(1) - a.at(1) : a.at(1) - b.at(1));
  const regTop = Object.entries(porReg).sort((a, b) => b.at(1) - a.at(1)).at(0);
  const ufTop = Object.entries(porUf).sort((a, b) => b.at(1) - a.at(1)).at(0);

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-regiao").textContent = regTop && regTop.at(1) > 0 ? regTop.at(0) : "Não disponível";
  document.getElementById("kpi-regiao-sub").textContent = regTop && regTop.at(1) > 0 ? `${regTop.at(1)} competições (${((regTop.at(1) / (total || 1)) * 100).toFixed(1)}%)` : "Sem registros";
  document.getElementById("kpi-estado").textContent = ufTop && ufTop.at(1) > 0 ? `${ESTADOS_INFO[ufTop.at(0)].at(0)} (${ufTop.at(0)})` : "Não disponível";
  document.getElementById("kpi-estado-sub").textContent = ufTop && ufTop.at(1) > 0 ? `${ufTop.at(1)} competições (${ESTADOS_INFO[ufTop.at(0)].at(1)})` : "Sem registros";
  document.getElementById("kpi-media").textContent = (total / 5).toFixed(1);

  if (chartsDash.reg) chartsDash.reg.destroy();
  chartsDash.reg = new Chart(document.getElementById("chart-regioes"), {
    type: "bar",
    data: {
      labels: regOrd.map(([r, qtd]) => `${r} (${qtd} • ${total ? ((qtd / total) * 100).toFixed(1) : 0}%)`),
      datasets: [{ label: "Competições", data: regOrd.map(x => x.at(1)), backgroundColor: regOrd.map(x => CORES_REG[x.at(0)]), borderRadius: 4 }]
    },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  const ufLista = Object.entries(porUf).sort((a, b) => ordem === "desc" ? b.at(1) - a.at(1) : a.at(1) - b.at(1));
  const top3 = Object.entries(porUf).sort((a, b) => b.at(1) - a.at(1)).slice(0, 3);
  document.getElementById("podium-estados").innerHTML = top3.map(([k, q], i) => `<div class="podium-item ${i===0?'top1':''}"><strong>${i+1}º ${ESTADOS_INFO[k].at(0)} (${k})</strong><br><small>${q} competições • ${ESTADOS_INFO[k].at(1)}</small></div>`).join("");

  if (chartsDash.uf) chartsDash.uf.destroy();
  chartsDash.uf = new Chart(document.getElementById("chart-estados"), {
    type: "bar",
    data: {
      labels: ufLista.map(([k, q]) => `${ESTADOS_INFO[k].at(0)} (${k}) - ${ESTADOS_INFO[k].at(1)} [${q}]`),
      datasets: [{ label: "Competições", data: ufLista.map(x => x.at(1)), backgroundColor: ufLista.map(([k]) => top3.some(t => t.at(0) === k) ? "#E30613" : "#002454"), borderRadius: 3 }]
    },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  const anosBase = [...new Set(baseDash.competicoes.map(c => c.ano))].sort((a, b) => a - b);
  const regsAtivas = [...document.querySelectorAll("#checks-regioes input:checked")].map(i => i.value);
  if (chartsDash.evo) chartsDash.evo.destroy();
  chartsDash.evo = new Chart(document.getElementById("chart-evolucao"), {
    type: "line",
    data: {
      labels: anosBase,
      datasets: regsAtivas.map(r => ({
        label: r, borderColor: CORES_REG[r], backgroundColor: CORES_REG[r], tension: 0.25,
        data: anosBase.map(a => filtradas.filter(c => c.regiao === r && c.ano === a).length)
      }))
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const maxUf = Math.max(...Object.values(porUf), 1);
  const proj = (lon, lat) => [((lon + 74.5) / 40.5) * 460 + 10, ((5.5 - lat) / 39.5) * 450 + 10];
  const paths = (geoBrasil?.features || []).map(feat => {
    const k = feat.properties.sigla;
    const q = porUf[k] || 0;
    const op = q === 0 ? 0.14 : (0.28 + (q / maxUf) * 0.72).toFixed(2);
    const geom = feat.geometry;
    const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
    let cx = 0, cy = 0, pts = 0;
    const d = polys.map(poly => poly.map(ring => ring.map((pt, idx) => {
      const [x, y] = proj(pt.at(0), pt.at(1));
      if (idx % 3 === 0) { cx += x; cy += y; pts++; }
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z").join(" ")).join(" ");
    const lx = pts ? (cx / pts).toFixed(1) : 0, ly = pts ? (cy / pts).toFixed(1) : 0;
    return `<g class="uf-tile ${k === ufSelecionada ? 'ativo' : ''}" data-uf="${k}" onclick="mostrarDetalheUf('${k}')"><path d="${d}" fill="rgba(0, 36, 84, ${op})" stroke="#ffffff" stroke-width="1.2"/><text x="${lx}" y="${ly}" text-anchor="middle" fill="${q/maxUf > 0.45 ? '#fff' : '#002454'}" font-weight="bold" font-size="9" style="pointer-events:none;">${k}</text></g>`;
  }).join("");
  document.getElementById("mapa-svg-box").innerHTML = `<svg viewBox="0 0 480 470" style="width:100%;max-width:470px;display:block;margin:0 auto;">${paths}</svg>`;
  mostrarDetalheUf(ufSelecionada);
}
function mostrarDetalheUf(k) {
  ufSelecionada = k;
  document.querySelectorAll(".uf-tile").forEach(el => el.classList.toggle("ativo", el.dataset.uf === k));
  const info = ESTADOS_INFO[k];
  const listaUf = baseDash.competicoes.filter(c => c.uf === k);
  const porAno = {};
  listaUf.forEach(c => porAno[c.ano] = (porAno[c.ano] || 0) + 1);
  const melhorAno = Object.entries(porAno).sort((a, b) => b.at(1) - a.at(1)).at(0);
  const part = baseDash.participantes_uf?.[k];
  document.getElementById("uf-detalhes").innerHTML = `
    <h4 style="color:#002454;margin-bottom:10px;font-size:1.1rem;">${info.at(0).toUpperCase()} (${k})</h4>
    <p style="margin-bottom:6px;"><strong>Região Geográfica:</strong> ${info.at(1)}</p>
    <p style="margin-bottom:6px;"><strong>Total de Competições Oficiais:</strong> ${listaUf.length}</p>
    <p style="margin-bottom:6px;"><strong>Participantes Únicos:</strong> ${part != null ? part : "Não disponível"}</p>
    <p><strong>Ano com Mais Competições:</strong> ${melhorAno ? `${melhorAno.at(0)} (${melhorAno.at(1)} eventos)` : "Não disponível"}</p>`;
}
