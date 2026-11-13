import json, urllib.request, zipfile, io, re, unicodedata
from datetime import datetime, timezone
SITE = "https:" + "//www.worldcubeassociation." + "org"
pag = urllib.request.urlopen(urllib.request.Request(f"{SITE}/export/results", headers={"User-Agent": "Mozilla/5.0"})).read().decode()
m = re.search(r'href="([^"]*WCA_export[^"]*\.tsv\.zip)"', pag)
url = m.group(1) if m.group(1).startswith("http") else SITE + m.group(1)
print("Baixando base oficial WCA...")
zf = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read()))
ESTADOS = {
    "AC": ("Acre", "Norte"), "AL": ("Alagoas", "Nordeste"), "AP": ("Amapá", "Norte"),
    "AM": ("Amazonas", "Norte"), "BA": ("Bahia", "Nordeste"), "CE": ("Ceará", "Nordeste"),
    "DF": ("Distrito Federal", "Centro-Oeste"), "ES": ("Espírito Santo", "Sudeste"),
    "GO": ("Goiás", "Centro-Oeste"), "MA": ("Maranhão", "Nordeste"), "MT": ("Mato Grosso", "Centro-Oeste"),
    "MS": ("Mato Grosso do Sul", "Centro-Oeste"), "MG": ("Minas Gerais", "Sudeste"),
    "PA": ("Pará", "Norte"), "PB": ("Paraíba", "Nordeste"), "PR": ("Paraná", "Sul"),
    "PE": ("Pernambuco", "Nordeste"), "PI": ("Piauí", "Nordeste"), "RJ": ("Rio de Janeiro", "Sudeste"),
    "RN": ("Rio Grande do Norte", "Nordeste"), "RS": ("Rio Grande do Sul", "Sul"),
    "RO": ("Rondônia", "Norte"), "RR": ("Roraima", "Norte"), "SC": ("Santa Catarina", "Sul"),
    "SP": ("São Paulo", "Sudeste"), "SE": ("Sergipe", "Nordeste"), "TO": ("Tocantins", "Norte")
}
def norm(s): return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")
NOMES_NORM = {norm(nm): k for k, (nm, _) in ESTADOS.items()}
f_comp = next(n for n in zf.namelist() if n.lower().endswith("competitions.tsv"))
linhas_c = zf.open(f_comp).read().decode().splitlines()
hc = linhas_c.pop(0).split("\t")
ic_id, ic_nm, ic_ct, ic_ps, ic_yr, ic_mt = hc.index("id"), hc.index("name"), hc.index("city_name"), hc.index("country_id"), hc.index("year"), hc.index("month")
ic_cn = hc.index("cancelled") if "cancelled" in hc else -1
comps = {}
for l in linhas_c:
    c = l.split("\t")
    if len(c) > max(ic_id, ic_ps, ic_yr) and c[ic_ps] == "Brazil":
        if ic_cn != -1 and c[ic_cn] == "1": continue
        cid, city = c[ic_id], c[ic_ct]
        uf = ""
        for p in reversed([x.strip() for x in city.split(",")]):
            if p.upper() in ESTADOS: uf = p.upper(); break
            if norm(p) in NOMES_NORM: uf = NOMES_NORM[norm(p)]; break
        if not uf:
            for k, (nm, _) in ESTADOS.items():
                if norm(nm) in norm(city): uf = k; break
        if uf:
            nm_uf, reg_uf = ESTADOS[uf]
            comps[cid] = {"id": cid, "nome": c[ic_nm], "uf": uf, "estado": nm_uf, "regiao": reg_uf, "ano": int(c[ic_yr]), "mes": int(c[ic_mt]) if c[ic_mt].isdigit() else 1}
f_res = next(n for n in zf.namelist() if n.lower().endswith("results.tsv"))
linhas_r = zf.open(f_res).read().decode().splitlines()
hr = linhas_r.pop(0).split("\t")
ir_cp, ir_ps = hr.index("competition_id"), hr.index("person_id")
part_uf = {uf: set() for uf in ESTADOS}
for l in linhas_r:
    c = l.split("\t")
    if len(c) > max(ir_cp, ir_ps) and c[ir_cp] in comps:
        part_uf[comps[c[ir_cp]]["uf"]].add(c[ir_ps])
saida = {
    "atualizado_em": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
    "competicoes": list(comps.values()),
    "participantes_uf": {uf: len(s) for uf, s in part_uf.items()}
}
json.dump(saida, open("competicoes_br.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"SUCESSO! {len(comps)} competicoes oficiais do Brasil processadas.")
