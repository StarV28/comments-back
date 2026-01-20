import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import type { CommentsWs } from "../../types/comments.type.js";

const clients: Set<WebSocket> = new Set();
//-------------------------------------------------------------------------------------//
export function setupWs(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🟢 New client connected");
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
      console.log("🔴 Client disconnected");
    });
  });
}

export function broadcastToClients(data: CommentsWs) {
  const message = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(message);
  });
}
