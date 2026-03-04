

(function () {
  function load(k, def) {
    try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); }
    catch { return def; }
  }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  // ── TAB CLOAK ──
  if (load("JustProxy_cloak_enabled", false)) {
    const title   = load("JustProxy_cloak_title", "");
    const _fav = load("JustProxy_cloak_favicon", "");
    const favicon = _fav === "custom" ? load("JustProxy_cloak_favicon_custom", "") : _fav;
    if (title) document.title = title;
    if (favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "shortcut icon"; document.head.appendChild(link); }
      link.href = favicon;
    }
  }

  // ── ANTI CLOSE ──
  if (load("JustProxy_anti_close", false)) {
    window.addEventListener("beforeunload", e => { e.preventDefault(); e.returnValue = ""; });
  }

  // ── PANIC KEY ──
  document.addEventListener("keydown", e => {
    if (!load("JustProxy_panic_enabled", false)) return;
    const key = load("JustProxy_panic_key", "");
    if (!key || e.key !== key) return;
    const url  = load("JustProxy_panic_url", "https://classroom.google.com");
    const dest = url === "custom" ? load("JustProxy_panic_custom_url", "https://www.google.com") : url;
    window.location.replace(dest);
  });

  // ── ALWAYS ABOUT:BLANK ──
  // If enabled and we're NOT already inside an about:blank iframe, launch it
  if (load("JustProxy_always_blank", false) && window.location === window.top.location) {
    const w = window.open("", "_blank");
    if (w) {
      const title = load("JustProxy_cloak_title", "") || "JustProxy";
      w.document.write(
        '<!DOCTYPE html><html><head><title>' + title + '</title></head>' +
        '<body style="margin:0;padding:0;background:#000;overflow:hidden">' +
        '<iframe src="' + location.href + '" ' +
        'style="position:fixed;inset:0;width:100%;height:100%;border:none" allowfullscreen>' +
        '</iframe></body></html>'
      );
      w.document.close();
    }
  }

  // ── EXPOSE GLOBALS ──
  window.JustProxy_SEARCH         = load("JustProxy_search", "https://www.google.com/search?q=");
  window.JustProxy_GAMES_OVERRIDE = load("JustProxy_games_override", null);

})();
