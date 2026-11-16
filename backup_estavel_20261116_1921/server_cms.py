import http.server, socketserver, urllib.request, json

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/wca/"):
            wca_id = self.path.split("/")[-1].strip().upper()
            url = f"https://worldcubeassociation.org{wca_id}"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    data = r.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8000), Handler) as httpd:
    print("Servidor CMS + API WCA rodando na porta 8000!")
    httpd.serve_forever()
