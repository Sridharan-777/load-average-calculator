const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "public");

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}

function calculateLoadAverage(loads, cpuCores) {
  const average = loads.reduce((total, load) => total + load, 0) / loads.length;
  const utilization = (average / cpuCores) * 100;

  let status = "Low";
  if (utilization >= 100) status = "Overloaded";
  else if (utilization >= 70) status = "High";
  else if (utilization >= 40) status = "Moderate";

  return {
    samples: loads.length,
    average: Number(average.toFixed(2)),
    minimum: Math.min(...loads),
    maximum: Math.max(...loads),
    cpuCores,
    utilization: Number(utilization.toFixed(2)),
    status,
  };
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/calculate") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });

    request.on("end", () => {
      try {
        const { loads, cpuCores } = JSON.parse(body);
        const validLoads = Array.isArray(loads) &&
          loads.length > 0 && loads.every((load) => Number.isFinite(load) && load >= 0);
        const validCores = Number.isInteger(cpuCores) && cpuCores > 0;

        if (!validLoads || !validCores) {
          return sendJson(response, 400, {
            error: "Enter one or more non-negative load values and a valid CPU core count.",
          });
        }

        sendJson(response, 200, calculateLoadAverage(loads, cpuCores));
      } catch {
        sendJson(response, 400, { error: "Invalid request data." });
      }
    });
    return;
  }

  const requestedFile = request.url === "/" ? "index.html" : request.url.slice(1);
  const safePath = path.normalize(requestedFile).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDirectory, safePath);

  fs.readFile(filePath, (error, data) => {
    if (error) return sendJson(response, 404, { error: "Page not found." });
    const extension = path.extname(filePath);
    const contentTypes = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "text/plain" });
    response.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Load Average Calculator: http://localhost:${PORT}`);
});

