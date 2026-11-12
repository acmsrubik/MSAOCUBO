const WCA = "https://www.worldcubeassociation.org/api/v0";

const EVENTOS = [
  ["333", "3x3x3"], ["222", "2x2x2"], ["444", "4x4x4"], ["555", "5x5x5"],
  ["666", "6x6x6"], ["777", "7x7x7"], ["333bf", "3x3 Olhos Vendados"],
  ["333fm", "Menos Movimentos"], ["333oh", "3x3 Uma Mão"], ["clock", "Clock"],
  ["minx", "Megaminx"], ["pyram", "Pyraminx"], ["skewb", "Skewb"],
  ["sq1", "Square-1"], ["444bf", "4x4 Olhos Vendados"],
  ["555bf", "5x5 Olhos Vendados"], ["333mbf", "Multi-Blind"],
];
const NOME = Object.fromEntries(EVENTOS);

const out = document.getElementById("resultado");
const boxPessoa = document.getElementById("pessoa");
const inputId = document.getElementById("wcaid");

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

/* ---------- Top 10 mundial por média (rankings.json) ---------- */

function tabelaRanking(lista, ev) {
  return `<div class="scroll"><table>
    <tr><th>#</th><th>Nome</th><th>WCA ID</th><th>Média</th></tr>
    ${lista.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><a href="https://www.worldcubeassociation.org/persons/${p.id}" target="_blank">${p.nome}</a></td>
        <td>${p.id}</td>
        <td><strong>${formatar(p.best, ev, "average")}</strong></td>
      </tr>`).join("")}
  </table></div>`;
}

async function carregarRankings() {
  try {
    const r = await fetch("rankings.json");
    if (!r.ok) throw new Error("rankings.json não encontrado. Rode: python3 atualizar.py");
    const dados = await r.json();

    const blocos = EVENTOS
      .filter(([ev]) => dados.eventos[ev]?.length)
      .map(([ev, nome]) => {
        const lista = dados.eventos[ev];
        return `
          <details class="modalidade" ${ev === "333" ? "open" : ""}>
            <summary>
              <span>${nome}</span>
              <span class="recorde">Recorde: ${formatar(lista[0].best, ev, "average")} (${lista[0].nome})</span>
            </summary>
            ${tabelaRanking(lista, ev)}
          </details>`;
      });

    out.innerHTML = blocos.join("") +
      `<p><small>Dados oficiais da WCA${dados.atualizado ? " • exportação de " + dados.atualizado : ""}</small></p>`;
  } catch (e) {
    out.innerHTML = `<p class="erro">Erro ao carregar rankings: ${e.message}</p>`;
  }
}

/* ---------- Busca por WCA ID (API oficial da WCA) ---------- */

async function buscarPessoa(idDigitado) {
  const id = idDigitado.trim().toUpperCase();
  if (!/^\d{4}[A-Z]{4}\d{2}$/.test(id)) {
    boxPessoa.innerHTML = `<p class="erro">WCA ID inválido. O formato é 4 números + 4 letras + 2 números (ex: 2015SOLE01).</p>`;
    return;
  }
  boxPessoa.textContent = "Buscando na WCA...";
  try {
    const d = await get(`${WCA}/persons/${id}`);
    const linhas = Object.entries(d.personal_records || {}).map(([ev, r]) => ({
      ev,
      single: r.single?.best, average: r.average?.best,
      sMundo: r.single?.world_rank, sBR: r.single?.country_rank,
      aMundo: r.average?.world_rank, aBR: r.average?.country_rank,
    }));
    const ordem = EVENTOS.map((e) => e[0]);
    linhas.sort((a, b) => ordem.indexOf(a.ev) - ordem.indexOf(b.ev));

    boxPessoa.innerHTML = `
      <div class="perfil">
        <strong>${d.person.name}</strong><br>
        ${id} • ${d.person.country_iso2} • ${d.competition_count} campeonatos •
        <a href="https://www.worldcubeassociation.org/persons/${id}" target="_blank">ver na WCA</a>
      </div>
      <div class="scroll"><table>
        <tr><th>Modalidade</th><th>Single</th><th>Rank Mundo</th><th>Rank BR</th><th>Média</th><th>Rank Mundo</th><th>Rank BR</th></tr>
        ${linhas.map((l) => `
          <tr>
            <td>${NOME[l.ev] ?? l.ev}</td>
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
carregarRankings();
