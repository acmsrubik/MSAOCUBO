with open("dashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

ini = js.index("  const maxUf = Math.max")
fim = js.index("  mostrarDetalheUf(ufSelecionada);")

novo_mapa = """  const maxUf = Math.max(...Object.values(porUf), 1);
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
    return `<g class="uf-tile" onclick="mostrarDetalheUf('${k}')"><path d="${d}" fill="rgba(0, 36, 84, ${op})" stroke="#ffffff" stroke-width="1.2"/><text x="${lx}" y="${ly}" text-anchor="middle" fill="${q/maxUf > 0.45 ? '#fff' : '#002454'}" font-weight="bold" font-size="9" style="pointer-events:none;">${k}</text></g>`;
  }).join("");
  document.getElementById("mapa-svg-box").innerHTML = `<svg viewBox="0 0 480 470" style="width:100%;max-width:470px;display:block;margin:0 auto;">${paths}</svg>`;
"""

js = js[:ini] + novo_mapa + js[fim:]
with open("dashboard.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Mapa geográfico real configurado!")
