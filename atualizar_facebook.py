with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Novo CSS estilo Facebook
novo_css = """  <style>
    body { background: #f0f2f5 !important; margin: 0; font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #050505; }
    
    /* Barra Superior idêntica ao Facebook */
    .top-nav { background: #fff !important; position: sticky; top: 0; z-index: 900; box-shadow: 0 1px 2px rgba(0,0,0,0.1); padding: 0 16px; height: 56px; }
    .nav-flex { width: 100%; height: 56px; display: flex; justify-content: space-between; align-items: center; }
    
    /* Esquerda: Logo Redonda Azul + Busca Redonda */
    .brand { display: flex; align-items: center; gap: 10px; width: 320px; }
    .logo-cms { background: #1877f2; color: #fff; font-weight: 900; font-size: 16px; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; letter-spacing: -0.5px; flex-shrink: 0; cursor: pointer; }
    .fb-search-box { background: #f0f2f5; border-radius: 50px; padding: 0 14px; height: 40px; display: flex; align-items: center; gap: 8px; flex: 1; max-width: 240px; }
    .fb-search-box input { background: transparent; border: none; outline: none; font-size: 14px; width: 100%; color: #050505; }
    
    /* Centro: Apenas Ícones Grandes estilo Facebook */
    .tabs { display: flex; gap: 8px; height: 100%; align-items: center; justify-content: center; flex: 1; max-width: 680px; }
    .tab-btn { height: 100%; flex: 1; max-width: 112px; display: flex; align-items: center; justify-content: center; border: none !important; background: transparent !important; color: #65676b !important; border-bottom: 3px solid transparent !important; padding: 0 !important; cursor: pointer; transition: 0.15s; position: relative; }
    .tab-btn:hover { background: #f0f2f5 !important; border-radius: 8px; height: 48px; }
    .tab-btn.active { color: #1877f2 !important; border-bottom: 3px solid #1877f2 !important; border-radius: 0 !important; height: 100% !important; }
    .tab-btn svg { width: 26px; height: 26px; }
    
    /* Direita: Atalhos estilo Facebook */
    .fb-nav-right { width: 320px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
    .fb-circle-btn { width: 40px; height: 40px; border-radius: 50%; background: #e4e6eb; border: none; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; color: #050505; }
    .fb-circle-btn:hover { background: #d8dadf; }

    /* Oculta a faixa escura sem quebrar os IDs do JS */
    .hero { display: none !important; }

    /* Layout Principal e Cards estilo Facebook */
    main.container { max-width: 1360px; margin: 16px auto 0; padding: 0 16px 40px; }
    .card-section { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .feed-box { max-width: 680px; margin: 0 auto; }
    .social-card { background: #fff; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border: none; }
    .social-input { width: 100%; background: #f0f2f5; border: none; border-radius: 20px; padding: 10px 16px; font-size: 15px; outline: none; box-sizing: border-box; }
    .social-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e4e6eb; }
    .btn-social-red { background: #1877f2; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
    .btn-social-red:hover { background: #166fe5; }
    .btn-social-gray { background: transparent; color: #65676b; border: none; padding: 8px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
    .btn-social-gray:hover { background: #f0f2f5; }
    .solve-badge { background: #f0f2f5; border-left: 4px solid #1877f2; padding: 10px 14px; border-radius: 6px; margin: 10px 0; }
  
    /* Grid de 3 colunas igual ao Facebook */
    .fb-grid { display: grid; grid-template-columns: 280px 1fr 300px; gap: 24px; align-items: start; }
    .fb-left .fb-side-card { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
    .fb-right .fb-side-card { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 16px; border: none; }
    .fb-menu-item { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #050505; font-size: 15px; transition: 0.15s; }
    .fb-menu-item:hover { background: #e4e6eb; }
    
    .reaction-wrapper { position: relative; display: inline-block; flex: 1; }
    .reaction-bar { display: none; position: absolute; bottom: 100%; left: 0; background: #fff; border-radius: 30px; padding: 6px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); border: 1px solid #ddd; gap: 8px; z-index: 50; margin-bottom: 6px; }
    .reaction-wrapper:hover .reaction-bar { display: flex; }
    .react-emoji { font-size: 20px; cursor: pointer; transition: transform 0.15s; border: none; background: none; padding: 2px; }
    .react-emoji:hover { transform: scale(1.35); }
    .post-media { width: 100%; max-height: 460px; object-fit: cover; border-radius: 8px; margin-top: 10px; }
    .comment-bubble { background: #f0f2f5; padding: 8px 12px; border-radius: 16px; font-size: 13px; display: inline-block; max-width: 100%; }
    .comment-meta { display: flex; gap: 12px; font-size: 11px; color: #65676b; font-weight: 700; margin: 3px 0 8px 10px; }
    .comment-meta span { cursor: pointer; }
    .comment-meta span:hover { text-decoration: underline; color: #1877f2; }
    .reply-list { margin-left: 26px; border-left: 2px solid #e4e6eb; padding-left: 10px; margin-top: 4px; }
    @media (max-width: 1024px) { .fb-grid { grid-template-columns: 1fr; } .fb-left, .fb-right { display: none; } .brand, .fb-nav-right { width: auto; } }
  </style>"""

# Novo Header apenas com Logo redonda, Pesquisa e Ícones
novo_header = """  <header class="top-nav">
    <div class="nav-flex">
      <div class="brand">
        <div class="logo-cms" onclick="document.querySelector('[data-tab=tab-feed]').click()">CMS</div>
        <div class="fb-search-box">
          <span>🔍</span>
          <input type="text" placeholder="Pesquisar no Cubo Mágico MS" />
        </div>
      </div>
      <nav class="tabs">
        <button class="tab-btn active" data-tab="tab-feed" title="Feed">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.1L1 12h3v9h7v-6h2v6h7v-9h3L12 2.1z"/></svg>
        </button>
        <button class="tab-btn" data-tab="tab-inicio" title="Calendário WCA">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
        </button>
        <button class="tab-btn" data-tab="tab-rankings" title="Rankings WCA">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg>
        </button>
        <button class="tab-btn" data-tab="tab-dashboard" title="Dashboard">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </button>
      </nav>
      <div class="fb-nav-right">
        <button class="fb-circle-btn" title="Calendário" onclick="document.querySelector('[data-tab=tab-inicio]').click()">📅</button>
        <button class="fb-circle-btn" title="Rankings" onclick="document.querySelector('[data-tab=tab-rankings]').click()">🏆</button>
        <button class="fb-circle-btn" title="Dashboard" onclick="document.querySelector('[data-tab=tab-dashboard]').click()">📊</button>
      </div>
    </div>
  </header>"""

import re
html = re.sub(r'<style>.*?</style>', novo_css, html, count=1, flags=re.DOTALL)
html = re.sub(r'<header class="top-nav">.*?</header>', novo_header, html, count=1, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("✅ Layout do Facebook aplicado com sucesso!")
