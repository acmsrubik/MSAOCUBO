# 1. Corrigir input.files e adicionar botão Baixar foto no modal de capa/perfil
c = open("capa_albuns.js", encoding="utf-8").read()
c = c.replace("const file = input.files && input.files;", "const file = input.files && input.files;")
c = c.replace(
    '<button id="cancelar-modal-crop"',
    '<a href="${imgData}" download="foto-cubo-ms.png" style="padding:8px 14px;border-radius:6px;background:#e4e6eb;color:#050505;text-decoration:none;font-weight:600;font-size:14px;">⬇️ Baixar foto</a><button id="cancelar-modal-crop"'
)
# Também permite arrastar a imagem da capa com o mouse dentro do preview
drag_js = """
        let arrastando = false, startY = 0, startPos = posY;
        boxPrev.style.cursor = "ns-resize";
        boxPrev.title = "Arraste para cima ou para baixo para reposicionar";
        boxPrev.onmousedown = (ev) => { arrastando = true; startY = ev.clientY; startPos = posY; };
        window.addEventListener("mousemove", (ev) => {
          if (!arrastando) return;
          const delta = (startY - ev.clientY) * 0.4;
          atualizarPos(startPos + delta);
        });
        window.addEventListener("mouseup", () => { arrastando = false; });
"""
c = c.replace('document.getElementById("btn-capa-descer").onclick = () => atualizarPos(posY + 8);', 'document.getElementById("btn-capa-descer").onclick = () => atualizarPos(posY + 8);\n' + drag_js)
open("capa_albuns.js", "w", encoding="utf-8").write(c)

# 2. Permitir clicar na Capa para abrir a foto inteira no visualizador Facebook
p = open("perfil.js", encoding="utf-8").read()
p = p.replace(
    '<div style="height:290px;${capaStyle}border-radius:0 0 8px 8px;position:relative;">',
    '<div onclick="if(event.target===this && \'${extra.capa || ""}\' && window.abrirFotoFacebook) window.abrirFotoFacebook(\'${extra.capa || ""}\')" title="Clique para ver a foto da capa" style="height:290px;${capaStyle}border-radius:0 0 8px 8px;position:relative;cursor:${extra.capa ? "pointer" : "default"};">'
)
open("perfil.js", "w", encoding="utf-8").write(p)

# 3. Atualizar versão no index.html para limpar cache
h = open("index.html", encoding="utf-8").read()
h = h.replace("capa_albuns.js?v=1", "capa_albuns.js?v=3").replace("perfil.js?v=5", "perfil.js?v=6")
open("index.html", "w", encoding="utf-8").write(h)
print("✅ Modal de Capa (Arrastar/Subir/Descer + Baixar + Legenda) e Clique na Capa ativados!")
