import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Client } from "ssh2";

const SSH_HOST = process.env.SSH_HOST;
const SSH_PORT = Number(process.env.SSH_PORT ?? "0");
const SSH_USERNAME = process.env.SSH_USERNAME;
const SSH_PASSWORD = process.env.SSH_PASSWORD;

export default function InitSsh(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const conn = new Client();
  conn
    .on("ready", () => {
      console.log("Client :: ready");
      conn.shell((err, stream) => {
        if (err) throw err;
        stream
          .on("close", () => {
            console.log("Stream :: close");
            conn.end();
          })
          .on("data", (data: any) => {
            console.log("OUTPUT: " + data);
            socket.emit("message", data);
          });
        socket.on("data", (data) => {
          stream.write(data);
        });
        socket.on("disconnect", (reason) => {
          console.log("disconnect", reason);
          stream.end("exit\n");
          conn.end();
        });
      });
    })
    .connect({
      host: SSH_HOST,
      port: SSH_PORT,
      username: SSH_USERNAME,
      password: SSH_PASSWORD,
    });
}
