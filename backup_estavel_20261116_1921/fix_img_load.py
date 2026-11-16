with open("inicio.js", "r", encoding="utf-8") as f:
    js = f.read()

antigo = """        if (urlFinal) {
          const el = document.getElementById(`logo-${c.id}`);
          if (el) el.src = urlFinal;
        }"""

novo = """        if (urlFinal) {
          const testeImg = new Image();
          testeImg.onload = () => {
            const el = document.getElementById(`logo-${c.id}`);
            if (el) el.src = urlFinal;
          };
          testeImg.src = urlFinal;
        }"""

js = js.replace(antigo, novo)
with open("inicio.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Validação de imagem e tamanho maior aplicados!")
