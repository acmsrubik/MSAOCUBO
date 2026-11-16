with open("inicio.js", "r", encoding="utf-8") as f:
    js = f.read()

antigo = """    ativas.forEach(async c => {
      try {
        const det = await (await fetch(`${WCA_COMP_API}/${c.id}`)).json();
        const org = det.organizers?.find(o => !o.wca_id && o.avatar && !o.avatar.is_default);
        const mdImg = (det.information || "").match(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/i);
        const s3Img = (det.information || "").match(/https:\/\/s3\.[^\s)"']+www\.worldcubeassociation\.org[^\s)"']+/i);
        const urlFinal = org?.avatar?.url || org?.avatar?.thumb_url || (mdImg ? mdImg.at(1) : null) || (s3Img ? s3Img.at(0) : null);
        if (urlFinal) {
          const teste = new Image();
          teste.onload = () => {
            const el = document.getElementById(`logo-${c.id}`);
            if (el) { el.src = urlFinal; el.style.display = "block"; }
          };
          teste.src = urlFinal;
        }
      } catch {}
    });"""

novo = """    ativas.forEach(async c => {
      try {
        const det = await (await fetch(`${WCA_COMP_API}/${c.id}`)).json();
        const orgs = (det.organizers || []).filter(o => !o.wca_id && o.avatar && !o.avatar.is_default);
        const info = det.information || "";
        const todasImgs = [...info.matchAll(/!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)/gi)].map(m => ({ alt: m.at(1).toLowerCase(), url: m.at(2) }));
        const validas = todasImgs.filter(x => !/flag|bandeira|emoji|twemoji|brasil|brazil|whatsapp|instagram|pix/.test(x.alt + x.url.toLowerCase()));
        const imgLogo = validas.find(x => /logo|escudo|cubo|open|show|championship|brasileiro/.test(x.alt + x.url.toLowerCase())) || validas.at(0);
        const urlFinal = imgLogo?.url || orgs.at(-1)?.avatar?.url || orgs.at(0)?.avatar?.url;
        if (urlFinal) {
          const teste = new Image();
          teste.onload = () => {
            if (teste.width >= 40 && teste.height >= 40) {
              const el = document.getElementById(`logo-${c.id}`);
              if (el) { el.src = urlFinal; el.style.display = "block"; }
            }
          };
          teste.src = urlFinal;
        }
      } catch {}
    });"""

js = js.replace(antigo, novo)
with open("inicio.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Filtro inteligente de logos aplicado!")
