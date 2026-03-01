
(function () {
  function sg(k, def) {
    try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); }
    catch { return def; }
  }
  function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  // ── TAB CLOAK ──
  if (sg("astriex_cloak_enabled", false)) {
    const title   = sg("astriex_cloak_title", "");
    const favicon = sg("astriex_cloak_favicon", "");
    if (title) document.title = title;
    if (favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "shortcut icon"; document.head.appendChild(link); }
      link.href = favicon;
    }
  }

  // ── ANTI CLOSE ──
  if (sg("astriex_anti_close", false)) {
    window.addEventListener("beforeunload", e => { e.preventDefault(); e.returnValue = ""; });
  }

  // ── PANIC KEY ──
  document.addEventListener("keydown", e => {
    if (!sg("astriex_panic_enabled", false)) return;
    const key = sg("astriex_panic_key", "");
    if (!key || e.key !== key) return;
    const url = sg("astriex_panic_url", "https://classroom.google.com");
    const dest = url === "custom" ? sg("astriex_panic_custom_url", "https://www.google.com") : url;
    window.location.replace(dest);
  });

  // ── SEARCH ENGINE (exposed for proxy bar) ──
  window.ASTRIEX_SEARCH = sg("astriex_search", "https://www.google.com/search?q=");

  // ── GAMES OVERRIDE (for imported games list) ──
  window.ASTRIEX_GAMES_OVERRIDE = sg("astriex_games_override", null);

  // ── EXPOSE HELPERS globally so settings.html can call them ──
  window.Astriex = {
    get: sg,
    set: ss,

    saveSearch:    (v) => ss("astriex_search", v),
    saveCloakEnabled: (v) => { ss("astriex_cloak_enabled", v); },
    saveCloakTitle:   (v) => ss("astriex_cloak_title", v),
    saveCloakFavicon: (v) => ss("astriex_cloak_favicon", v),
    savePanicEnabled: (v) => ss("astriex_panic_enabled", v),
    savePanicKey:     (v) => ss("astriex_panic_key", v),
    savePanicUrl:     (v) => ss("astriex_panic_url", v),
    savePanicCustom:  (v) => ss("astriex_panic_custom_url", v),
    saveAntiClose:    (v) => ss("astriex_anti_close", v),
    saveAlwaysBlank:  (v) => ss("astriex_always_blank", v),
    saveGamesOverride:(v) => ss("astriex_games_override", v),

    launchAboutBlank() {
      const w = window.open("about:blank", "_blank");
      if (!w) { alert("Pop-up blocked — allow pop-ups for this site."); return; }
      const title = sg("astriex_cloak_title", "") || "Astriex";
      const html = '<!DOCTYPE html><html><head><title>' + title + '</title></head>'
        + '<body style="margin:0;padding:0;overflow:hidden;background:#000">'
        + '<iframe src="' + location.origin + '/index.html" '
        + 'style="width:100vw;height:100vh;border:none;display:block" allowfullscreen>'
        + '</iframe></body></html>';
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };
})();
