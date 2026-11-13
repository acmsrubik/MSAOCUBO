with open("dashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

alvo = """    const isDash = btn.dataset.tab === "tab-dashboard";
    document.getElementById("hero-titulo").textContent = isDash ? "DASHBOARD NACIONAL DE COMPETIÇÕES WCA" : "TABELA DE CLASSIFICAÇÃO & RECORDES MUNDIAIS";
    document.getElementById("hero-sub").textContent = isDash ? "Análise geográfica e histórica das competições oficiais realizadas no Brasil." : "Acompanhe os tempos oficiais e pesquise o histórico competitivo de qualquer cubista registrado.";"""

novo = """    const tab = btn.dataset.tab;
    const isDash = tab === "tab-dashboard";
    const titulos = {
      "tab-inicio": ["CALENDÁRIO OFICIAL & NOTÍCIAS DO CUBO MÁGICO", "Confira as competições oficiais no Brasil nos próximos 30 dias e acompanhe as últimas novidades."],
      "tab-rankings": ["TABELA DE CLASSIFICAÇÃO & RECORDES MUNDIAIS", "Acompanhe os tempos oficiais e pesquise o histórico competitivo de qualquer cubista registrado."],
      "tab-dashboard": ["DASHBOARD NACIONAL DE COMPETIÇÕES WCA", "Análise geográfica e histórica das competições oficiais realizadas no Brasil."]
    };
    document.getElementById("hero-titulo").textContent = titulos[tab].at(0);
    document.getElementById("hero-sub").textContent = titulos[tab].at(1);"""

js = js.replace(alvo, novo)
with open("dashboard.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Abas atualizadas com sucesso!")
