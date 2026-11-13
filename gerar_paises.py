import json, urllib.request, zipfile, io, re
SITE = "https:" + "//www.worldcubeassociation." + "org"
EVS = {"333","222","444","555","666","777","333bf","333fm","333oh","clock","minx","pyram","skewb","sq1","444bf","555bf","333mbf"}
PAISES = {"Brazil","USA","China","Poland","Hong Kong","Russia","United Kingdom","Chile","Argentina","Colombia","Mexico","Portugal","Spain","Japan","Korea","Australia"}
pag = urllib.request.urlopen(urllib.request.Request(f"{SITE}/export/results", headers={"User-Agent": "Mozilla/5.0"})).read().decode()
m = re.search(r'href="([^"]*WCA_export[^"]*\.tsv\.zip)"', pag)
url = m.group(1) if m.group(1).startswith("http") else SITE + m.group(1)
print("Baixando base oficial WCA...")
zf = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read()))
f_pes = next(n for n in zf.namelist() if n.lower().endswith("persons.tsv"))
linhas_p = zf.open(f_pes).read().decode().splitlines()
hp = linhas_p.pop(0).split("\t")
i_id = hp.index("id") if "id" in hp else hp.index("wca_id")
i_nm, i_ps = hp.index("name"), hp.index("country_id")
i_sb = hp.index("sub_id") if "sub_id" in hp else hp.index("subid")
atletas = {}
for l in linhas_p:
    c = l.split("\t")
    if len(c) > max(i_id, i_nm, i_ps, i_sb) and c[i_ps] in PAISES and c[i_sb] == "1": atletas[c[i_id]] = (c[i_nm], c[i_ps])
dados = {p: {"single": {e: [] for e in EVS}, "average": {e: [] for e in EVS}} for p in PAISES}
for tipo, chave in [("single", "rankssingle.tsv"), ("average", "ranksaverage.tsv")]:
    fn = next(n for n in zf.namelist() if n.lower().replace("_", "").endswith(chave))
    linhas_r = zf.open(fn).read().decode().splitlines()
    hr = linhas_r.pop(0).split("\t")
    r_id, r_ev, r_bs, r_rk = hr.index("person_id"), hr.index("event_id"), hr.index("best"), hr.index("country_rank")
    for l in linhas_r:
        c = l.split("\t")
        if len(c) > max(r_id, r_ev, r_bs, r_rk) and c[r_id] in atletas and c[r_ev] in EVS and c[r_rk].isdigit() and 1 <= int(c[r_rk]) <= 100:
            nm, ps = atletas[c[r_id]]
            dados[ps][tipo][c[r_ev]].append({"pos": int(c[r_rk]), "id": c[r_id], "nome": nm, "best": int(c[r_bs]), "regiao": ps, "comp": "Ranking Nacional WCA"})
for p in PAISES:
    for t in ["single", "average"]:
        for e in EVS: dados[p][t][e].sort(key=lambda x: x["pos"])
json.dump(dados, open("paises.json", "w", encoding="utf-8"), ensure_ascii=False)
print("PRONTO! paises.json criado com sucesso!")
