const API = "https:" + "//www.worldcubeassociation." + "org/api/v0";
const SITE = "https:" + "//www.worldcubeassociation." + "org";
const EVENTOS = [["333","3x3x3"],["222","2x2x2"],["444","4x4x4"],["555","5x5x5"],["666","6x6x6"],["777","7x7x7"],["333bf","3x3 Olhos Vendados"],["333fm","Menos Movimentos"],["333oh","3x3 Uma Mão"],["clock","Clock"],["minx","Megaminx"],["pyram","Pyraminx"],["skewb","Skewb"],["sq1","Square-1"],["444bf","4x4 Olhos Vendados"],["555bf","5x5 Olhos Vendados"],["333mbf","Multi-Blind"]];
const REGIOES = [["world","MUNDO (TOP 100 GLOBAL)"],["Brazil","BRASIL"],["USA","ESTADOS UNIDOS"],["China","CHINA"],["Poland","POLÔNIA"],["Hong Kong","HONG KONG"],["Russia","RÚSSIA"],["United Kingdom","REINO UNIDO"],["Chile","CHILE"],["Argentina","ARGENTINA"],["Colombia","COLÔMBIA"],["Mexico","MÉXICO"],["Portugal","PORTUGAL"],["Spain","ESPANHA"],["Japan","JAPÃO"],["Korea","COREIA DO SUL"],["Australia","AUSTRÁLIA"]];
const out = document.getElementById("resultado"), boxPessoa = document.getElementById("pessoa"), inputId = document.getElementById("wcaid");
const tradutorPais = new Intl.DisplayNames(["pt-BR"], { type: "region" });
function nomePais(cod) {
  if (!cod) return "—";
  try { return cod.length === 2 ? tradutorPais.of(cod.toUpperCase()) : cod; } catch { return cod; }
}
function formatar(v, ev, tipo) {
  if (v == null || v <= 0) return "—";
  if (ev === "333mbf") {
    const s = String(v).padStart(9, "0"), c = 99 - parseInt(s.slice(0, 2)) + parseInt(s.slice(7, 9)), t = parseInt(s.slice(2, 7));
    return `${c}/${c + parseInt(s.slice(7, 9))} em ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
  }
  if (ev === "333fm") return tipo === "average" ? (v / 100).toFixed(2) : String(v);
  const tot = v / 100, m = Math.floor(tot / 60), sec = (tot % 60).toFixed(2).padStart(m ? 5 : 1, "0");
  return m ? `${m}:${sec}` : sec;
}
let cachePaises = null;
async function carregarTabela() {
  const ev = document.getElementById("filtro-mod").value;
  const tipo = ev === "333mbf" ? "single" : document.getElementById("filtro-tipo").value;
  const regFiltro = document.getElementById("filtro-regiao").value;
  const box = document.getElementById("tabelas-box");
  box.innerHTML = "<p style='padding:15px;'>Carregando classificação oficial...</p>";
  try {
    let lista = [];
    if (regFiltro === "world") {
      const d = await (await fetch(`${API}/results/rankings/${ev}/${tipo}`)).json();
      const bruto = Array.isArray(d) ? d : (d.items || d.rankings || []);
      lista = bruto.slice(0, 100).map((p, i) => ({
        pos: p.world_rank || p.rank || (i + 1), id: p.person_id || p.wca_id || "", nome: p.person_name || p.name || "",
        best: p.best || p.value, regiao: nomePais(p.person_country_id || p.country_iso2 || p.country_id || ""), comp: p.competition_name || p.competition_id || ""
      }));
    } else {
      if (!cachePaises) cachePaises = await (await fetch("paises.json")).json();
      lista = (cachePaises[regFiltro]?.[tipo]?.[ev] || []).slice(0, 100);
    }
    if (!lista.length) { box.innerHTML = "<p style='padding:15px;'>Nenhum resultado encontrado para este país.</p>"; return; }
    const nomeEv = EVENTOS.find(x => x.includes(ev))?.at(1) || ev;
    const linhas = lista.map(p => `<tr><td><span class="pos-badge">${p.pos}</span></td><td><a href="${SITE}/persons/${p.id}" target="_blank">${p.nome}</a></td><td><strong>${formatar(p.best, ev, tipo)}</strong></td><td>${p.regiao}</td><td>${p.comp}</td></tr>`).join("");
    box.innerHTML = `<details class="modalidade" open><summary><span>${nomeEv.toUpperCase()} (${tipo === "single" ? "TEMPO ÚNICO" : "MÉDIA"})</span><span class="recorde">RECORDE: ${formatar(lista.at(0).best, ev, tipo)}</span></summary><div class="scroll"><table><tr><th>#</th><th>Nome</th><th>Resultado</th><th>Região</th><th>Competição</th></tr>${linhas}</table></div></details>`;
  } catch (e) { box.innerHTML = `<p style="color:#E30613;">Erro: ${e.message}</p>`; }
}
function iniciar() {
  out.innerHTML = `<div class="filtro-box"><label><strong>MODALIDADE:</strong> <select id="filtro-mod">${EVENTOS.map(([ev, n]) => `<option value="${ev}">${n.toUpperCase()}</option>`).join("")}</select></label><label><strong>TIPO:</strong> <select id="filtro-tipo"><option value="single">TEMPO ÚNICO (SINGLE)</option><option value="average">MÉDIA (AVERAGE)</option></select></label><label><strong>REGIÃO:</strong> <select id="filtro-regiao">${REGIOES.map(([v, n]) => `<option value="${v}">${n}</option>`).join("")}</select></label></div><div id="tabelas-box"></div>`;
  document.getElementById("filtro-mod").addEventListener("change", carregarTabela);
  document.getElementById("filtro-tipo").addEventListener("change", carregarTabela);
  document.getElementById("filtro-regiao").addEventListener("change", carregarTabela);
  carregarTabela();
}
async function buscarPessoa() {
  const id = inputId?.value.trim().toUpperCase();
  if (!id) return;
  boxPessoa.innerHTML = "<p>Consultando ficha oficial...</p>";
  try {
    const d = await (await fetch(`${API}/persons/${id}`)).json();
    const linhas = EVENTOS.filter(([ev]) => d.personal_records?.[ev]).map(([ev, n]) => `<tr><td><strong>${n}</strong></td><td>${formatar(d.personal_records[ev].single?.best, ev, "single")}</td><td>${formatar(d.personal_records[ev].average?.best, ev, "average")}</td></tr>`).join("");
    boxPessoa.innerHTML = `<h4 style="color:#002454;margin:12px 0;">FICHA OFICIAL: ${d.person.name.toUpperCase()} (${d.person.wca_id}) — ${nomePais(d.person.country_iso2)}</h4><div class="scroll"><table><tr><th>MODALIDADE</th><th>SINGLE (1x)</th><th>MÉDIA (Ao5)</th></tr>${linhas}</table></div>`;
  } catch { boxPessoa.innerHTML = "<p style='color:#E30613;font-weight:bold;'>Atleta não encontrado.</p>"; }
}
document.getElementById("btn-buscar")?.addEventListener("click", buscarPessoa);
inputId?.addEventListener("keydown", (e) => { if (e.key === "Enter") buscarPessoa(); });
iniciar();
