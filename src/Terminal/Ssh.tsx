import React, { useEffect, useLayoutEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Terminal } from 'xterm';
import styles from "./Terminal.module.css"

function Ssh() {
  const [term, setTerm] = useState<Terminal>()
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>()
  useLayoutEffect(() => {
    const terminalDom = document.getElementById('terminal')
    if (!terminalDom) return
    const term = new Terminal();
    term.open(terminalDom);
    term.writeln('\x1b[1;33mSunteco\x1B[0m ')
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    term.reset()
    term.clear()
    term.focus()
    term.options = {
      fontSize: 16,
      convertEol: true
    }
    setTerm(term);
    return () => {
      term.dispose()
    }
  }, [])
  useLayoutEffect(() => {
    const nextSocket = io("http://localhost:5100")
    nextSocket.emit("init-ssh");
    setSocket(nextSocket);
    return () => {
      socket?.removeAllListeners()
      socket?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!term || !socket) return
    socket.on("message", (data: any) => {
      console.log("message from server =====>", data);
      var uint8View = new Uint8Array(data);
      term.write(uint8View);
    });
    term.onKey((data: any) => {
      console.log(data, data.key)
      term.write(data);
      socket.emit("data", data.key);
    })
  }, [socket, term])
  return (
    <div className={styles.terminal} id="terminal"></div>
  );
}

export default Ssh