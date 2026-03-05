/*global Ultraviolet*/

function safeXorEncode(url) {
  const xored = Ultraviolet.codec.xor.encode(url);
  return xored.replace(/[`^\\|{}[\]<>"']/g, c => encodeURIComponent(c));
}

function safeXorDecode(url) {
  const restored = url.replace(/%[0-9A-Fa-f]{2}/g, c => decodeURIComponent(c));
  return Ultraviolet.codec.xor.decode(restored);
}

const uvConfig = {
  prefix: "/uv/service/",
  bare: "https://bare-server-production-a258.up.railway.app/",
  encodeUrl: safeXorEncode,
  decodeUrl: safeXorDecode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};

// Set in both window and service worker scope
if (typeof self !== "undefined") self.__uv$config = uvConfig;
if (typeof window !== "undefined") window.__uv$config = uvConfig;