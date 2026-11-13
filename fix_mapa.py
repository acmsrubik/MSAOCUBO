with open("dashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace(
    'let baseDash = null, chartsDash = {}, ufSelecionada = "SP";',
    'let baseDash = null, geoBrasil = null, chartsDash = {}, ufSelecionada = "SP";'
)
js = js.replace(
    'baseDash = await r.json();',
    'baseDash = await r.json();\n    if (!geoBrasil) geoBrasil = await (await fetch("brasil_mapa.json")).json();'
)
with open("dashboard.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Bloco 1 aplicado!")
