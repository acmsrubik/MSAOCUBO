import json, urllib.request, re, html
BASE = "https:" + "//www.worldcubeassociation." + "org/results/rankings"
EVS = ["333","222","444","555","666","777","333bf","333fm","333oh","clock","minx","pyram","skewb","sq1","444bf","555bf","333mbf"]
def limpa(t): return html.unescape(re.sub(r"<[^>]+>", "", t)).strip()
dados = {"single": {}, "average": {}}
for tipo in ["single", "average"]:
    for ev in EVS:
        if tipo == "average" and ev == "333mbf": continue
        print("Puxando WCA:", ev, tipo)
        req = urllib.request.Request(f"{BASE}/{ev}/{tipo}", headers={"User-Agent": "Mozilla/5.0"})
        pagina = urllib.request.urlopen(req).read().decode("utf-8")
        linhas = re.findall(r"<tr[^>]*>(.*?)</tr>", pagina, re.S)
        lista = []
        for tr in linhas:
            tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
            if len(tds) >= 5:
                it = iter(tds)
                c1, c2, c3, c4, c5 = next(it), next(it), next(it), next(it), next(it)
                m = re.search(r"/persons/([A-Z0-9]+)", c2)
                if m and limpa(c1).isdigit():
                    lista.append({"pos": int(limpa(c1)), "id": m.group(1), "nome": limpa(c2), "best": limpa(c3), "regiao": limpa(c4), "comp": limpa(c5)})
        dados[tipo][ev] = lista[:30]
json.dump(dados, open("rankings.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("DADOS REAIS DA WCA SALVOS COM SUCESSO!")
