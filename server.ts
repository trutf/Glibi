const server = Bun.serve({
  port: 3333,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./src${filePath}`);
    return new Response(file);
  },
});

console.log(`Launcher running at http://localhost:${server.port}`);
