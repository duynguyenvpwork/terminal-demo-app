import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import os from "os";
const pty = require("node-pty");

export default function InitLocalTerminal(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
  const ptyProcess = pty.spawn(shell, [], {
    name: socket.id,
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
  });
  ptyProcess.on("data", function (data: any) {
    socket.emit("message", data);
  });
  socket.on("data", (data) => {
    ptyProcess.write(data);
  });
  setTimeout(() => {
    ptyProcess.write("\r");
  }, 500);
  console.log("a user connected: " + socket.id);
  socket.on("disconnect", (reason) => {
    console.log("disconnect", reason);
    ptyProcess.write("exit\r");
  });
}
