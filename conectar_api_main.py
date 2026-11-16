with open("perfil.js", "r", encoding="utf-8") as f:
    code = f.read()

ini = code.index("window.sincronizarWCA = async function")
fim = code.index("window.salvarDetalhesApresentacao")

nova_sync = """window.sincronizarWCA = async function(email, wcaIdInput) {
    const wcaId = (wcaIdInput || "").trim().toUpperCase();
    if (!wcaId) return alert("Digite um WCA ID válido (ex: 2024ALME13).");
    const statusEl = document.getElementById("wca-sync-status");
    if (statusEl) statusEl.textContent = "⏳ Buscando dados oficiais na WCA...";

    try {
      const baseApi = (typeof API !== "undefined") ? API : "https://worldcubeassociation.org";
      const resp = await fetch(`${baseApi}/persons/${encodeURIComponent(wcaId)}`);
      if (!resp.ok) throw new Error("Atleta não encontrado na base oficial.");
      const data = await resp.json();
      const p = data.person;

      const atual = window.getUsuarioAtualCMS();
      if (atual.e === email) {
        atual.w = wcaId;
        localStorage.setItem("cms_s", JSON.stringify(atual));
      }
      const listaU = JSON.parse(localStorage.getItem("cms_u") || "[]");
      const idx = listaU.findIndex(x => x.e === email);
      if (idx >= 0) { listaU[idx].w = wcaId; localStorage.setItem("cms_u", JSON.stringify(listaU)); }

      const extra = getPerfilExtra(email);
      extra.wcaData = {
        id: p.wca_id,
        nome: p.name,
        pais: p.country_iso2,
        competicoes: data.competition_count || 0,
        medalhas: data.medals || { gold: 0, silver: 0, bronze: 0 },
        recordes: data.personal_records || {}
      };
      savePerfilExtra(email, extra);

      if (statusEl) statusEl.textContent = "✅ Dados oficiais sincronizados!";
      window.renderPerfil();
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ " + err.message;
      alert("Erro ao consultar WCA: " + err.message);
    }
  };

  """

code = code[:ini] + nova_sync + code[fim:]
with open("perfil.js", "w", encoding="utf-8") as f:
    f.write(code)
print("✅ Perfil conectado exatamente à mesma API da aba Rankings!")
