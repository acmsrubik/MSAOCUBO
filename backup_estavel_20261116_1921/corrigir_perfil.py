with open("perfil.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Corrigir o erro de JavaScript que deixava o perfil em branco
code = code.replace('alvo.n.split(" ").toLowerCase()', 'alvo.n.split(" ")[0].toLowerCase()')

# 2. Mostrar apenas usuários realmente cadastrados (sem lista falsa)
lista_antiga = """    const base = [
      { n: "Jefferson", e: "jefferson@cubomagicoms.com.br", w: "" },
      { n: "Patrick Ponce", e: "patrick.ponce@wca.org", w: "2012PONC02" },
      { n: "Tymon Kolasinski", e: "tymon@wca.org", w: "2016KOLA02" },
      { n: "Max Park", e: "max.park@wca.org", w: "2012PARK03" },
      { n: "Yiheng Wang", e: "yiheng@wca.org", w: "2019WANG01" }
    ];"""
code = code.replace(lista_antiga, "    const base = [];")

# 3. Corrigir upload de imagem (input.files[0])
code = code.replace("const file = input.files && input.files;", "const file = input.files && input.files[0];")

# 4. Adicionar botão flutuante estilo Facebook (Nova Mensagem) e esconder "CONTA: JEFFERSON"
extra_ui = """
  const oldBtn = document.getElementById("btn-login-cms");
  if (oldBtn) oldBtn.style.display = "none";

  if (!document.getElementById("fb-new-msg-btn")) {
    const msgBtn = document.createElement("button");
    msgBtn.id = "fb-new-msg-btn";
    msgBtn.title = "Nova mensagem";
    msgBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 2.5a2.12 2.12 0 0 1 3 3L8.5 16.75l-4 1 1-4L16.75 2.5zM4 20h16v2H4v-2z"/></svg>`;
    msgBtn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;width:48px;height:48px;border-radius:50%;background:#fff;color:#050505;border:none;box-shadow:0 2px 12px rgba(0,0,0,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.15s;";
    msgBtn.onmouseover = () => msgBtn.style.background = "#f0f2f5";
    msgBtn.onmouseout = () => msgBtn.style.background = "#fff";
    msgBtn.onclick = () => alert("💬 Chat entre cubistas amigos em breve!");
    document.body.appendChild(msgBtn);
  }
})();"""

code = code.replace("})();", extra_ui)

with open("perfil.js", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ Perfil corrigido, lista filtrada para cadastrados e botão de mensagem adicionado!")
