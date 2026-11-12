import csv, io, json, os, sys, tempfile, urllib.request, zipfile, datetime

API = "https://www.worldcubeassociation.org/api/v0/export/public"
HEADERS = {"User-Agent": "cubo-ms-site"}

def baixar_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def achar_zip(info):
    achados = []
    def varrer(x, chave=""):
        if isinstance(x, dict):
            for k, v in x.items():
                varrer(v, k)
        elif isinstance(x, list):
            for v in x:
                varrer(v, chave)
        elif isinstance(x, str) and x.startswith("http") and x.lower().endswith(".zip"):
            achados.append((chave, x))
    varrer(info)
    for chave, url in achados:
        if "tsv" in chave.lower() or "tsv" in url.lower():
            return url
    return achados[0][1] if achados else None

def norm(k):
    return k.lower().replace("_", "")

def linhas(zf, trecho):
    nome = next(n for n in zf.namelist()
                if trecho in n.lower().replace("_", "") and n.lower().endswith(".tsv"))
    print("Lendo", nome)
    txt = io.TextIOWrapper(zf.open(nome), encoding="utf-8", newline="")
    for row in csv.DictReader(txt, delimiter="\t"):
        yield {norm(k): v for k, v in row.items()}

print("Consultando a WCA...")
info = baixar_json(API)
url = achar_zip(info)
if not url:
    print("Nao achei o link do arquivo. Resposta da WCA:")
    print(json.dumps(info, indent=2)[:1500])
    sys.exit(1)

print("Baixando (pode levar alguns minutos):", url)
tmp = os.path.join(tempfile.gettempdir(), "wca_export.zip")
req = urllib.request.Request(url, headers=HEADERS)
with urllib.request.urlopen(req) as r, open(tmp, "wb") as f:
    while True:
        bloco = r.read(1024 * 1024)
        if not bloco:
            break
        f.write(bloco)

zf = zipfile.ZipFile(tmp)

pessoas = {}
for p in linhas(zf, "persons"):
    if p.get("subid", "1") not in ("1", ""):
        continue
    pid = p.get("wcaid") or p.get("id")
    pessoas[pid] = p.get("name", pid)

candidatos = {}
for r in linhas(zf, "ranksaverage"):
    pid = r.get("personid")
    ev = r.get("eventid")
    try:
        best = int(r["best"])
    except (KeyError, ValueError):
        continue
    if best <= 0 or pid not in pessoas:
        continue
    wr = r.get("worldrank")
    if wr is None or (wr.isdigit() and int(wr) <= 10):
        candidatos.setdefault(ev, []).append((best, pid))

eventos = {}
for ev, lista in candidatos.items():
    eventos[ev] = [
        {"id": pid, "nome": pessoas[pid], "best": b}
        for b, pid in sorted(lista)[:10]
    ]

saida = {
    "atualizado": info.get("export_date") if isinstance(info, dict) else None,
    "gerado_em": datetime.date.today().isoformat(),
    "eventos": eventos,
}
with open("rankings.json", "w", encoding="utf-8") as f:
    json.dump(saida, f, ensure_ascii=False)

print("Pronto! rankings.json criado com", len(eventos), "modalidades.")
