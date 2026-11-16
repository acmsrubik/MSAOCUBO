import json, urllib.request, zipfile, io
U = "https:" + "//www.worldcubeassociation." + "org/export/results/WCA_export.tsv.zip"
EVS = {"333","222","444","555","666","777","333bf","333fm","333oh","clock","minx","pyram","skewb","sq1","444bf","555bf","333mbf"}
print("Baixando base oficial WCA (aguarde ~15s)...")
zf = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(U, headers={"User-Agent": "Mozilla/5.0"})).read()))
comps = {l.decode().split("\t").pop(0): l.decode().split("\t") for l in list(zf.open("WCA_export_Competitions.tsv"))[1:]}
br = {}
for l in list(zf.open("WCA_export_Persons.tsv"))[1:]:
    p = l.decode().split("\t")
    if len(p) > 4 and p[3] == "Brazil" and p[4] == "1": br[p[0]] = p[2]
comps = {}
for l in list(zf.open("WCA_export_Competitions.tsv"))[1:]:
    it = iter(l.decode().split("\t"))
    cid, cname = next(it, ""), next(it, "")
    if cid: comps[cid] = cname
br = {}
for l in list(zf.open("WCA_export_Persons.tsv"))[1:]:
    it = iter(l.decode().split("\t"))
    pid, _, nome, pais, sub = next(it, ""), next(it, ""), next(it, ""), next(it, ""), next(it, "")
    if pais == "Brazil" and sub == "1": br[pid] = nome
dados = {"single": {e: [] for e in EVS}, "average": {e: [] for e in EVS}}
for tipo, fn in [("single", "WCA_export_RanksSingle.tsv"), ("average", "WCA_export_RanksAverage.tsv")]:
    for l in list(zf.open(fn))[1:]:
        it = iter(l.decode().strip().split("\t"))
        pid, ev, best, _, _, crk = next(it, ""), next(it, ""), next(it, "0"), next(it, ""), next(it, ""), next(it, "999")
        if pid in br and ev in EVS and crk.isdigit() and int(crk) <= 30:
            dados[tipo][ev].append({"pos": int(crk), "id": pid, "nome": br[pid], "best": int(best), "regiao": "Brasil", "comp": "Recorde Nacional WCA"})
for t in dados:
    for e in EVS: dados[t][e].sort(key=lambda x: x["pos"])
json.dump(dados, open("brasil.json", "w", encoding="utf-8"), ensure_ascii=False)
print("TOP 30 DO BRASIL GERADO COM SUCESSO!")
