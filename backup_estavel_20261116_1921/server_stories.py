import json, os, random, time, subprocess

HIST_USUARIOS_FILE = "historico_reels_usuarios.json"
BANCO_REELS_FILE = "banco_reels_cms.json"


def carregar_banco_reels():
    if os.path.exists(BANCO_REELS_FILE):
        try:
            with open(BANCO_REELS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def gerar_query_combinatoria(cat):
    puzzles = ["Rubiks cube", "Rubik's cube 3x3", "Rubik's cube 2x2", "Rubik's cube 4x4", "Pyraminx Rubik", "Megaminx Rubik", "Cubo Magico", "Speedcube"]
    temas = {
        "wca": ["WCA competition", "WCA final", "WCA championship", "WCA official solve"],
        "recordes": ["world record", "WR single", "sub 4 solve", "Yiheng Wang", "Max Park"],
        "tutoriais": ["tutorial", "F2L tricks", "PLL algorithms", "OLL algorithms", "CFOP method"],
        "brasil": ["Brasil WCA", "campeonato brasileiro cubo magico", "cubista brasileiro"],
        "todos": ["speedcubing", "unboxing", "GAN cube", "MoYu", "Tornado V3", "solve"]
    }
    return f"{random.choice(puzzles)} {random.choice(temas.get(cat, temas['todos']))} #shorts"

def eh_video_rubik_valido(titulo):
    t = (titulo or "").lower()
    return any(k in t for k in ("rubik", "cube", "cubo", "wca", "3x3", "2x2", "4x4", "pyraminx", "megaminx", "skewb", "speedcub", "f2l", "pll", "oll", "gan", "moyu"))

def carregar_hist_usuario(user_email):
    if not user_email or not os.path.exists(HIST_USUARIOS_FILE):
        return set()
    try:
        with open(HIST_USUARIOS_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f).get(user_email, []))
    except Exception:
        return set()

def registrar_visto_usuario(user_email, vid):
    if not user_email or not vid:
        return
    dados = {}
    if os.path.exists(HIST_USUARIOS_FILE):
        try:
            with open(HIST_USUARIOS_FILE, "r", encoding="utf-8") as f:
                dados = json.load(f)
        except Exception:
            dados = {}
    lista = dados.get(user_email, [])
    if vid not in lista:
        lista.append(vid)
        dados[user_email] = lista[-100000:]
        with open(HIST_USUARIOS_FILE, "w", encoding="utf-8") as f:
            json.dump(dados, f, ensure_ascii=False)

import time
import os
import os
REELS_UPLOAD_DIR = 'uploads_reels'
os.makedirs(REELS_UPLOAD_DIR, exist_ok=True)
import subprocess
import http.server, socketserver, urllib.request, urllib.parse, json, os, tempfile

P = chr(46)
DEEZER_URL = "https://api" + P + "deezer" + P + "com/search?limit=15&q="
LIVE_DIR = os.path.join(tempfile.gettempdir(), "cms_live_stream")
os.makedirs(LIVE_DIR, exist_ok=True)
LIVE_CHATS = {}

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith((".js", ".css", ".json", ".png", ".jpg", ".webp")):
            self.send_header("Cache-Control", "public, max-age=86400")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.send_header("X-CDN-Edge", "MSAOCUBO-Global-Ready")
        super().end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b""
        if parsed.path == "/api/reels/upload":
            nome_arq = f"reel_{int(time.time()*1000)}.mp4"
            caminho = os.path.join(REELS_UPLOAD_DIR, nome_arq)
            with open(caminho, "wb") as f:
                f.write(body)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"url": "/" + REELS_UPLOAD_DIR + "/" + nome_arq}).encode("utf-8"))
        elif parsed.path == "/api/live/chunk":
            lid = "".join(c for c in (qs.get("id") or ["default"]).pop(0) if c.isalnum())
            arq = os.path.join(LIVE_DIR, f"{lid}.webm")
            mode = "wb" if qs.get("reset") else "ab"
            with open(arq, mode) as f:
                f.write(body)
            self.send_response(200)
            self.end_headers()
        elif parsed.path == "/api/live/chat":
            lid = "".join(c for c in (qs.get("id") or ["default"]).pop(0) if c.isalnum())
            msg = json.loads(body.decode("utf-8"))
            LIVE_CHATS.setdefault(lid, []).append(msg)
            LIVE_CHATS[lid] = LIVE_CHATS[lid][-50:]
            self.send_response(200)
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        if parsed.path == "/api/reels":
            cat = (qs.get("cat") or ["todos"]).pop(0).strip().lower()
            user_email = (qs.get("user") or [""]).pop(0).strip().lower()
            ja_vistos = carregar_hist_usuario(user_email)
            banco = carregar_banco_reels()
            filtrados = [x for x in banco if (cat == "todos" or x.get("cat") == cat) and x.get("vid") not in ja_vistos]
            if not filtrados and banco:
                filtrados = [x for x in banco if (cat == "todos" or x.get("cat") == cat)] or banco
            random.shuffle(filtrados)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"results": filtrados[:60], "totalBanco": len(banco)}).encode("utf-8"))
        elif parsed.path == "/api/musicas":
            termo = (qs.get("q") or [""]).pop(0).strip()
            resultados = []
            try:
                req = urllib.request.Request(DEEZER_URL + urllib.parse.quote(termo), headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=8) as r:
                    dados = json.loads(r.read().decode("utf-8"))
                    for m in dados.get("data", []):
                        if m.get("preview"):
                            resultados.append({"trackName": m.get("title", ""), "artistName": m.get("artist", {}).get("name", ""), "previewUrl": "/api/mp3?u=" + urllib.parse.quote(m.get("preview", ""))})
            except Exception as e:
                print("Erro Deezer:", e)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"results": resultados}).encode("utf-8"))
        elif parsed.path == "/api/mp3":
            mp3_url = (qs.get("u") or [""]).pop(0)
            try:
                req = urllib.request.Request(mp3_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    data = r.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "audio/mpeg")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
            except Exception:
                self.send_response(404)
                self.end_headers()
        elif parsed.path == "/api/live/video":
            lid = "".join(c for c in (qs.get("id") or ["default"]).pop(0) if c.isalnum())
            arq = os.path.join(LIVE_DIR, f"{lid}.webm")
            if os.path.exists(arq):
                with open(arq, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "video/webm")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404)
                self.end_headers()
        elif parsed.path == "/api/live/chat":
            lid = "".join(c for c in (qs.get("id") or ["default"]).pop(0) if c.isalnum())
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"msgs": LIVE_CHATS.get(lid, [])}).encode("utf-8"))
        else:
            super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", 8000), Handler) as httpd:
    print("✅ Servidor MSAOCUBO com Músicas + Transmissão Live ativo na porta 8000!")
    httpd.serve_forever()
