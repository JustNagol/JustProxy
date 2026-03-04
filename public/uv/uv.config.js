/*global Ultraviolet*/
self.__uv$config = {
  prefix: "/uv/service/",
  bare: "https://bare-server-production-a258.up.railway.app/",
  encodeUrl: Ultraviolet.codec.plain.encode,
  decodeUrl: Ultraviolet.codec.plain.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
