with open("inicio.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace(
    'const logoOrg = c.organizers?.find(o => o.avatar && !o.avatar.is_default)?.avatar?.thumb_url || WCA_LOGO;',
    'const logoOrg = WCA_LOGO;'
)
js = js.replace(
    'onerror="this.src=\'${WCA_LOGO}\'"',
    'onerror="this.style.display=\'none\'"'
)

with open("inicio.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Logo oficial aplicada sem fotos de pessoas!")
