const WCA = "https://www.worldcubeassociation.org/api/v0";
const COMUNIDADE =
  "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api";

const EVENTOS = {
  "333": "3x3x3", "222": "2x2x2", "444": "4x4x4", "555": "5x5x5",
  "666": "6x6x6", "777": "7x7x7", "333bf": "3x3 Olhos Vendados",
  "333fm": "Menos Movimentos", "333oh": "3x3 Uma Mão", "clock": "Clock",
  "minx": "Megaminx", "pyram": "Pyraminx", "skewb": "Skewb",
  "sq1": "Square-1", "444bf": "4x4 Olhos Vendados",
  "555bf": "5x5 Olhos Vendados", "333mbf": "Multi-Blind",
};

const selEvento = document.getElementById("evento");
const selTipo = document.getElementById("tipo");
const out = document.getElementById("resultado");
const boxPessoa = document.getElementById("pessoa");
const inputId = document.getElementById("wcaid");

for (const [id, nome] of Object.entries(EVENTOS)) {
  selEvento.add(new Option(nome, id));
}

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Erro ${r.status}`);
  return r.json();
}

function formatar(valor, evento, tipo) {
  if (valor == null || valor <= 0) return "—";
  if (evento === "333mbf") {
    const s = String(valor).padStart(9, "0");
    const dd = parseInt(s.slice(0, 2));
    const tempo = parseInt(s.slice(2, 7));
    const erros = parseInt(s.slice(7, 9));
    const certos = 99 - dd + erros;
    const m = Math.floor(tempo / 60);
    const sec = String(tempo % 60).padStart(2, "0");
    return `${certos}/${certos + erros} em ${m}:${sec}`;
  }
  if (evento === "333fm") {
    return tipo === "average" ? (valor / 100).toFixed(2) : String(valor);
  }
  const total = valor / 100;
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(2).padStart(m ? 5 : 1, "0");
  return m ? `${m}:${s}` : s;
}

/* ---------- Rankings (mundo e Brasil) ---------- */

const cacheNomes = {};
async function nomeDe(item) {
  if (item.personName) return item.personName;
  const id = item.personId ?? item.id;
  if (cacheNomes[id]) return cacheNomes[id];
  try {
    const p = await get(`${COMUNIDADE}/persons/${id}.json`);
    cacheNomes[id] = p.name ?? id;
  } catch {
    cacheNomes[id] = id;
  }
  return cacheNomes[id];
}

async function topo(regiao, tipo, evento, qtd) {
  const dados = await get(`${COMUNIDADE}/rank/${regiao}/${tipo}/${evento}.json`);
  const itens = (dados.items ?? dados).slice(0, qtd);
  return Promise.all(
    itens.map(async (it, i) => ({
      pos: i + 1,
      nome: await nomeDe(it),
      id: it.personId ?? it.id,
      tempo: formatar(it.best, evento, tipo),
    }))
  );
}

function tabelaRanking(linhas) {
  return `<div class="scroll"><table>
    <tr><th>#</th><th>Nome</th><th>WCA ID</th><th>Tempo</th></tr>
    ${linhas.map((l) => `
      <tr>
        <td>${l.pos}</td>
        <td><a href="https://www.worldcubeassociation.org/persons/${l.id}" target="_blank">${l.nome}</a></td>
        <td>${l.id}</td>
        <td><strong>${l.tempo}</strong></td>
      </tr>`).join("")}
  </table></div>`;
}

async function carregarRankings() {
  const evento = selEvento.value;
  const tipo = selTipo.value;
  out.textContent = "Carregando...";
  try {
    const [mundo, brasil] = await Promise.all([
      topo("world", tipo, evento, 10),
      topo("BR", tipo, evento, 10),
    ]);
    out.innerHTML = `
      <h2>🌍 Recorde mundial</h2>
      <div class="destaque"><span>${mundo[0].nome}</span><strong>${mundo[0].tempo}</strong></div>
      <h2>🌍 Top 10 do mundo</h2>
      ${tabelaRanking(mundo)}
      <h2>🇧🇷 Top 10 do Brasil</h2>
      ${tabelaRanking(brasil)}`;
  } catch (e) {
    out.innerHTML = `<p class="erro">Erro ao carregar rankings: ${e.message}</p>`;
  }
}

/* ---------- Busca por WCA ID ---------- */

async function buscarPessoa(idDigitado) {
  const id = idDigitado.trim().toUpperCase();
  if (!/^\d{4}[A-Z]{4}\d{2}$/.test(id)) {
    boxPessoa.innerHTML = `<p class="erro">WCA ID inválido. O formato é 4 números + 4 letras + 2 números (ex: 2015SOLE01).</p>`;
    return;
  }
  boxPessoa.textContent = "Buscando na WCA...";
  try {
    let nome, pais, comps, linhas;
    try {
      const d = await get(`${WCA}/persons/${id}`);
      nome = d.person.name;
      pais = d.person.country_iso2;
      comps = d.competition_count;
      linhas = Object.entries(d.personal_records || {}).map(([ev, r]) => ({
        ev,
        single: r.single?.best,
        average: r.average?.best,
        sMundo: r.single?.world_rank,
        sBR: r.single?.country_rank,
        aMundo: r.average?.world_rank,
        aBR: r.average?.country_rank,
      }));
    } catch {
      // plano B: API da comunidade
      const d = await get(`${COMUNIDADE}/persons/${id}.json`);
      nome = d.name;
      pais = d.country;
      comps = d.numberOfCompetitions;
      const mapa = {};
      for (const s of d.rank?.singles ?? []) {
        mapa[s.eventId] = { ev: s.eventId, single: s.best, sMundo: s.rank?.world, sBR: s.rank?.country };
      }
      for (const a of d.rank?.averages ?? []) {
        mapa[a.eventId] = { ...(mapa[a.eventId] ?? { ev: a.eventId }), average: a.best, aMundo: a.rank?.world, aBR: a.rank?.country };
      }
      linhas = Object.values(mapa);
    }

    const ordem = Object.keys(EVENTOS);
    linhas.sort((a, b) => ordem.indexOf(a.ev) - ordem.indexOf(b.ev));

    boxPessoa.innerHTML = `
      <div class="perfil">
        <strong>${nome}</strong><br>
        ${id} • ${pais} • ${comps} campeonatos •
        <a href="https://www.worldcubeassociation.org/persons/${id}" target="_blank">ver na WCA</a>
      </div>
      <div class="scroll"><table>
        <tr><th>Modalidade</th><th>Single</th><th>Rank Mundo</th><th>Rank BR</th><th>Média</th><th>Rank Mundo</th><th>Rank BR</th></tr>
        ${linhas.map((l) => `
          <tr>
            <td>${EVENTOS[l.ev] ?? l.ev}</td>
            <td><strong>${formatar(l.single, l.ev, "single")}</strong></td>
            <td>${l.sMundo ?? "—"}</td><td>${l.sBR ?? "—"}</td>
            <td><strong>${formatar(l.average, l.ev, "average")}</strong></td>
            <td>${l.aMundo ?? "—"}</td><td>${l.aBR ?? "—"}</td>
          </tr>`).join("")}
      </table></div>`;
  } catch (e) {
    boxPessoa.innerHTML = `<p class="erro">Não encontrei esse WCA ID (${e.message}).</p>`;
  }
}

document.getElementById("btnBuscar").addEventListener("click", () => buscarPessoa(inputId.value));
inputId.addEventListener("keydown", (e) => { if (e.key === "Enter") buscarPessoa(inputId.value); });
selEvento.addEventListener("change", carregarRankings);
selTipo.addEventListener("change", carregarRankings);
carregarRankings();
