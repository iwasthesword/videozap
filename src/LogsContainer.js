import React, { useState, useEffect } from "react";
import { Console, Hook, Unhook } from "console-feed";

const LogsContainer = () => {
  //const [show, setShow] = useState(true);
  const [logs, setLogs] = useState([]);

  // run once!
  useEffect(() => {
    Hook(
      window.console,
      (log) => {
        if (!log.data.includes("[info] use ffmpeg.wasm v0.9.8")) {
          setLogs((currLogs) => [log, ...currLogs]);
        }
      },
      false
    );
    return () => Unhook(window.console);
  }, []);

  return (
    <>
      {/*<button onClick={() => setShow(!show)}>Console</button>*/}
      {/*show ? (*/
        <div
          style={{
            backgroundColor: "#242424",
            maxHeight: "85vh",
            minHeight: "85vh",
            width: "100%",
            margin: "auto",
            overflowY: "scroll",
            textAlign: "start",
          }}
        >
          <Console logs={logs} variant="dark" />
        </div>
      /*) : null*/}
    </>
  );
};

export default LogsContainer;
