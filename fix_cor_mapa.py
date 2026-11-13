with open("style.css", "a", encoding="utf-8") as f:
    f.write("\n.uf-tile:hover path { stroke: #E30613; stroke-width: 2.2px; }\n.uf-tile.ativo path { fill: #E30613 !important; stroke: #002454; stroke-width: 2px; }\n.uf-tile.ativo text { fill: #ffffff !important; }\n")

with open("dashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace(
    '<g class="uf-tile" onclick="mostrarDetalheUf(\'${k}\')">',
    '<g class="uf-tile ${k === ufSelecionada ? \'ativo\' : \'\'}" data-uf="${k}" onclick="mostrarDetalheUf(\'${k}\')">'
)
js = js.replace(
    'ufSelecionada = k;',
    'ufSelecionada = k;\n  document.querySelectorAll(".uf-tile").forEach(el => el.classList.toggle("ativo", el.dataset.uf === k));'
)

with open("dashboard.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Destaque em vermelho no clique aplicado com sucesso!")
