import React, { useState, useEffect } from "react";
import { Console, Hook, Unhook } from "console-feed";

const LogsContainer = () => {
  const [show, setShow] = useState(false);
  const [logs, setLogs] = useState([]);

  // run once!
  useEffect(() => {
    Hook(
      window.console,
      (log) => setLogs((currLogs) => [...currLogs, log]),
      false
    );
    return () => Unhook(window.console);
  }, []);

  return (
    <>
      <button onClick={() => setShow(!show)}>Console</button>
      {show ? (
        <div
          style={{
            backgroundColor: "#242424",
            maxHeight: "50vh",
            minHeight: "50vh",
            maxWidth: "800px",
            margin: "auto",
            overflowY: "scroll",
            textAlign: "start",
          }}
        >
          <Console logs={logs} variant="dark" />
        </div>
      ) : null}
    </>
  );
};

export default LogsContainer;
