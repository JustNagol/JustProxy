/*global Ultraviolet*/

// XOR encode but make result URL-safe by percent-encoding special chars
function safeXorEncode(url) {
  const xored = Ultraviolet.codec.xor.encode(url);
  // percent-encode any char that could be mangled by Vercel's edge
  return xored.replace(/[`^\\|{}[\]<>"']/g, c => encodeURIComponent(c));
}

function safeXorDecode(url) {
  // undo the extra percent-encoding before XOR decode
  const restored = url.replace(/%[0-9A-Fa-f]{2}/g, c => decodeURIComponent(c));
  return Ultraviolet.codec.xor.decode(restored);
}

self.__uv$config = {
  prefix: "/uv/service/",
  bare: "https://bare-server-production-a258.up.railway.app/",
  encodeUrl: safeXorEncode,
  decodeUrl: safeXorDecode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
