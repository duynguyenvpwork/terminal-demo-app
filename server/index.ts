import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import InitLocalTerminal from "./localTerminal";
import InitSsh from "./ssh";

const SERVER_PORT = process.env.SERVER_PORT ?? 5100;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000",
  },
});

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

io.on("connection", (socket) => {
  socket.on("init-powershell", () => {
    InitLocalTerminal(socket);
  });
  socket.on("init-ssh", () => {
    InitSsh(socket);
  });
});

server.listen(SERVER_PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${SERVER_PORT}`
  );
});
