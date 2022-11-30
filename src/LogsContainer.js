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
      {
        /*show ? (*/
        <div
          className="bg-black w-100 text-start"
          style={{
            maxHeight: "85vh",
            minHeight: "85vh",
            margin: "auto",
            overflowY: "scroll",
          }}
        >
          <Console logs={logs} variant="dark" styles={{LOG_COLOR: "var(--bs-primary)"}} />
        </div>
        /*) : null*/
      }
    </>
  );
};

export default LogsContainer;
