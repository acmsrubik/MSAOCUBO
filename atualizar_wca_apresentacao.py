with open("perfil.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Trocar a URL da API WCA para o endpoint sem bloqueio CORS
code = code.replace(
    'const API_WCA = "https://worldcubeassociation.org";',
    'const API_WCA = "https://githubusercontent.com";'
)

# 2. Atualizar a função sincronizarWCA para ler o formato JSON da WCA REST API
func_antiga_inicio = code.index("window.sincronizarWCA = async function")
func_antiga_fim = code.index("window.uploadImagemPerfil = function")

nova_sync = """window.sincronizarWCA = async function(email, wcaIdInput) {
    const wcaId = (wcaIdInput || "").trim().toUpperCase();
    if (!wcaId) return alert("Digite um WCA ID válido (ex: 2024ALME13).");
    const statusEl = document.getElementById("wca-sync-status");
    if (statusEl) statusEl.textContent = "⏳ Buscando dados oficiais na WCA...";

    try {
      const resp = await fetch(API_WCA + encodeURIComponent(wcaId) + ".json");
      if (!resp.ok) throw new Error("WCA ID não encontrado na base oficial.");
      const data = await resp.json();

      const atual = window.getUsuarioAtualCMS();
      if (atual.e === email) {
        atual.w = wcaId;
        localStorage.setItem("cms_s", JSON.stringify(atual));
      }
      const listaU = JSON.parse(localStorage.getItem("cms_u") || "[]");
      const idx = listaU.findIndex(x => x.e === email);
      if (idx >= 0) { listaU[idx].w = wcaId; localStorage.setItem("cms_u", JSON.stringify(listaU)); }

      const recordesMap = {};
      (data.rank?.singles || []).forEach(s => {
        recordesMap[s.eventId] = recordesMap[s.eventId] || {};
        recordesMap[s.eventId].single = { best: s.best, national_rank: s.rank?.country, world_rank: s.rank?.world };
      });
      (data.rank?.averages || []).forEach(a => {
        recordesMap[a.eventId] = recordesMap[a.eventId] || {};
        recordesMap[a.eventId].average = { best: a.best, national_rank: a.rank?.country, world_rank: a.rank?.world };
      });

      const extra = getPerfilExtra(email);
      extra.wcaData = {
        id: data.id || wcaId,
        nome: data.name || atual.n,
        pais: data.country || "BR",
        competicoes: data.numberOfCompetitions || 0,
        medalhas: data.medals || { gold: 0, silver: 0, bronze: 0 },
        recordes: recordesMap
      };
      savePerfilExtra(email, extra);

      if (statusEl) statusEl.textContent = "✅ Dados oficiais sincronizados!";
      window.renderPerfil();
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ " + err.message;
      alert("Erro ao consultar API da WCA: " + err.message);
    }
  };

  window.salvarDetalhesApresentacao = function(email) {
    const extra = getPerfilExtra(email);
    extra.bio = document.getElementById("edit-bio")?.value.trim() || extra.bio;
    extra.cidade = document.getElementById("edit-cidade")?.value.trim() || extra.cidade;
    extra.origem = document.getElementById("edit-origem")?.value.trim() || "";
    extra.trabalho = document.getElementById("edit-trabalho")?.value.trim() || "";
    extra.estudo = document.getElementById("edit-estudo")?.value.trim() || "";
    extra.cuboMain = document.getElementById("edit-cubo")?.value.trim() || "";
    extra.editandoBio = false;
    savePerfilExtra(email, extra);
    window.renderPerfil();
  };

  window.abrirEditorApresentacao = function(email) {
    const extra = getPerfilExtra(email);
    extra.editandoBio = !extra.editandoBio;
    savePerfilExtra(email, extra);
    window.renderPerfil();
  };

  """

code = code[:func_antiga_inicio] + nova_sync + code[func_antiga_fim:]
with open("perfil.js", "w", encoding="utf-8") as f:
    f.write(code)
print("✅ Parte 1 concluída!")
