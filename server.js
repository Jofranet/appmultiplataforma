const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos (index.html)
app.use(express.static(path.join(__dirname, "public")));

// WebSocket: señalización
wss.on("connection", (ws) => {
  console.log("Nuevo cliente conectado");

  ws.on("message", (message) => {
    // Reenviar mensaje a otros clientes
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:3000`);
});

