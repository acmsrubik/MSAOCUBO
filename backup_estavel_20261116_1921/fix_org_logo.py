with open("inicio.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace(
    'const logoOrg = WCA_LOGO;',
    'const orgOficial = c.organizers?.find(o => !o.wca_id && o.avatar && !o.avatar.is_default);\n      const logoOrg = orgOficial ? (orgOficial.avatar.thumb_url || orgOficial.avatar.url) : WCA_LOGO;'
)

js = js.replace(
    'onerror="this.style.display=\'none\'"',
    'onerror="this.src=\'' + "' + WCA_LOGO + '" + '\'"'
)

with open("inicio.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Filtro exclusivo de logo da organização aplicado!")
