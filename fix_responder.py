with open("feed.js", "r", encoding="utf-8") as f:
    code = f.read()

# Substituir qualquer uso de prompt("Escreva sua resposta:") por caixa inline estilo Facebook
import re

nova_func_resp = """function responderComentario(postId, comIdx) {
  const boxId = `reply-box-${postId}-${comIdx}`;
  let box = document.getElementById(boxId);
  if (box) { box.remove(); return; }

  const p = postsCubistas.find(x => x.id === postId);
  if (!p || !p.comentarios[comIdx]) return;
  const alvoAutor = p.comentarios[comIdx].autor;

  const spanClicado = event && event.target ? event.target : null;
  const containerMeta = spanClicado ? spanClicado.closest(".comment-meta") : null;
  if (!containerMeta) return;

  box = document.createElement("form");
  box.id = boxId;
  box.style.cssText = "display:flex;gap:6px;margin:6px 0 10px 26px;align-items:center;";
  box.innerHTML = `
    <input type="text" placeholder="Responder a ${alvoAutor}..." autocomplete="off" style="flex:1;background:#f0f2f5;border:none;border-radius:18px;padding:7px 12px;font-size:12px;outline:none;">
    <button type="submit" style="background:#1877f2;color:#fff;border:none;border-radius:16px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">Responder</button>
  `;
  box.onsubmit = (e) => {
    e.preventDefault();
    const val = box.querySelector("input").value.trim();
    if (!val) return;
    const eu = (window.getUsuarioAtualCMS ? window.getUsuarioAtualCMS().n : "Jefferson");
    p.comentarios[comIdx].respostas = p.comentarios[comIdx].respostas || [];
    p.comentarios[comIdx].respostas.push({ autor: eu, texto: val });
    salvarFeed();
    renderFeed();
    if (window.renderPerfil) window.renderPerfil();
  };
  containerMeta.insertAdjacentElement("afterend", box);
  box.querySelector("input").focus();
}"""

# Localiza a função que chama prompt( e substitui inteira
if "prompt(" in code:
    idx_prompt = code.index("prompt(")
    idx_func = code.rindex("function ", 0, idx_prompt)
    # Acha o fechamento de chaves da função
    abertas = 0
    fim_func = idx_func
    for i in range(idx_func, len(code)):
        if code[i] == "{": abertas += 1
        elif code[i] == "}":
            abertas -= 1
            if abertas == 0:
                fim_func = i + 1
                break
    nome_antigo = code[idx_func:code.index("(", idx_func)].replace("function ", "").strip()
    nova_func_adaptada = nova_func_resp.replace("responderComentario", nome_antigo)
    code = code[:idx_func] + nova_func_adaptada + code[fim_func:]
    with open("feed.js", "w", encoding="utf-8") as f:
        f.write(code)
    print(f"✅ Função '{nome_antigo}' atualizada para resposta inline estilo Facebook!")
else:
    print("Nenhum prompt encontrado.")
