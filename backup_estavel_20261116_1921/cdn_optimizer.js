(function() {
  window.otimizarImagemCDN = function(fileOrDataUrl, maxLado = 1080, qualidade = 0.82) {
    return new Promise((resolve) => {
      const processarSrc = (src) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxLado || h > maxLado) {
            if (w > h) { h = Math.round((h * maxLado) / w); w = maxLado; }
            else { w = Math.round((w * maxLado) / h); h = maxLado; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const webp = canvas.toDataURL("image/webp", qualidade);
          resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", qualidade));
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };

      if (typeof fileOrDataUrl === "string") {
        processarSrc(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => processarSrc(e.target.result);
        reader.readAsDataURL(fileOrDataUrl);
      }
    });
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    });
  }
})();
