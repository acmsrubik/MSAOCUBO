with open("feed.js", "r", encoding="utf-8") as f:
    code = f.read()

# Mostra onde estava o prompt e substitui por resposta inline
import re

# Adiciona a função global abrirRespostaInline no topo do feed.js
helper = """
window.abrirRespostaInline = function(el, postId, comIdx) {
  const boxId = `reply-inline-${postId}-${comIdx}`;
  const existente = document.getElementById(boxId);
  if (existente) { existente.remove(); return; }
  const p = postsCubistas.find(x => x.id === postId);
  if (!p || !p.comentarios[comIdx]) return;
  const meta = el.closest(".comment-meta") || el.parentElement;
  const form = document.createElement("form");
  form.id = boxId;
  form.style.cssText = "display:flex;gap:6px;margin:6px 0 8px 24px;align-items:center;";
  form.innerHTML = `<input type="text" placeholder="Responder a ${p.comentarios[comIdx].autor}..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:7px 12px;font-size:12px;outline:none;"><button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>`;
  form.onsubmit = function(ev) {
    ev.preventDefault();
    const txt = form.querySelector("input").value.trim();
    if (!txt) return;
    const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
    p.comentarios[comIdx].respostas = p.comentarios[comIdx].respostas || [];
    p.comentarios[comIdx].respostas.push({ autor: eu, texto: txt });
    salvarFeed();
    renderFeed();
    if (window.renderPerfil) window.renderPerfil();
  };
  meta.insertAdjacentElement("afterend", form);
  form.querySelector("input").focus();
};
"""

if "window.abrirRespostaInline" not in code:
    code = helper + "\n" + code

# Troca o onclick do Responder no template do feed.js
code = re.sub(r'onclick="[^"]*prompt\([^"]*"', r'onclick="window.abrirRespostaInline(this, ${p.id}, ${idx})"', code)
# Caso a variável do índice no loop do feed.js tenha outro nome (ex: i ou ci), ajusta dinamicamente:
code = code.replace('onclick="window.abrirRespostaInline(this, ${p.id}, ${idx})"', 'onclick="window.abrirRespostaInline(this, ${p.id}, ${typeof idx!==\'undefined\'?idx:(typeof i!==\'undefined\'?i:0)})"')

with open("feed.js", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ Prompt removido! Restantes no feed.js:", code.count("prompt("))
