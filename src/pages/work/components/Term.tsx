import { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export const Term = () => {
  const terminalRef = useRef<Terminal>(null);
  const fitAddonRef = useRef<FitAddon>(null);
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 15,
      fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
      rightClickSelectsWord: true,
      theme: {
        background: "#212121",
        foreground: "#d4d4d4",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    if (terminalContainerRef.current) {
      terminal.open(terminalContainerRef.current);
      // 调整终端大小以适应容器
      fitAddon.fit();
      // 向终端写入消息
      terminal.write("Welcome to terminal!\r\n");
      terminal.write("$ ");
    }

    return () => {
      terminal.dispose();
    };
  }, []);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (terminalRef.current && fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={terminalContainerRef} style={{ width: "100%", height: "100%", padding: 18 }} />;
};
