import clipboard from 'clipboardy';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Terminal } from 'xterm';
import styles from "./Terminal.module.css"

function Ssh() {
  const [term, setTerm] = useState<Terminal>()
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>()
  const eventRef = useRef<string>()
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
      fontSize: 15,
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
      var uint8View = new Uint8Array(data);
      term.write(uint8View);
    });
    term.onKey((data: any) => {
      term.write(data);
      socket.emit("data", data.key);
    })
    term.attachCustomKeyEventHandler((key: KeyboardEvent) => {
      if (key.code === 'Insert') {
        if (key.shiftKey) {
          eventRef.current = "paste"
          clipboard.read().then(cmd => {
            clipboard.write('')
            const cmdArr = Array.from(cmd)
            cmdArr.forEach(c => {
              socket.emit("data", c);
            })
          }).finally(() => {
            eventRef.current = undefined
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
    if (!!term.textarea) {
      term.textarea.onpaste = (ev) => {
        if (eventRef.current !== "paste") {
          clipboard.read().then(cmd => {
            clipboard.write('')
            const cmdArr = Array.from(cmd)
            cmdArr.forEach(c => {
              socket.emit("data", c);
            })
          }).finally(() => {
            eventRef.current = undefined
          })
        }
      }
    }
  }, [socket, term])
  return (
    <div className={styles.terminal} id="terminal"></div>
  );
}

export default Ssh