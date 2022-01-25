import clipboard from 'clipboardy';
import { useEffect, useLayoutEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Terminal } from 'xterm';
import styles from "./Terminal.module.css"

function LocalTerminal() {
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
    nextSocket.emit("init-powershell");
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
      term.write(data);
    });
    term.onKey((data: any) => {
      console.log(data, data.key)
      term.write(data);
      socket.emit("data", data.key);
    })
    term.attachCustomKeyEventHandler((key: KeyboardEvent) => {
      console.log(key.code, key.ctrlKey, key.shiftKey)
      if (key.code === 'Insert') {
        if (key.shiftKey) {
          clipboard.read().then(cmd => {
            clipboard.write('')
            const cmdArr = Array.from(cmd)
            cmdArr.forEach(c => {
              socket.emit("data", c);
            })
          })
          return false;
        }
        if (key.ctrlKey) {
          if (term.hasSelection()) {
            const selectedText = term.getSelection()
            clipboard.write(selectedText)
          }
        }
      }
      return true;
    })
  }, [socket, term])
  return (
    <div className={styles.terminal} id="terminal"></div>
  );
}

export default LocalTerminal