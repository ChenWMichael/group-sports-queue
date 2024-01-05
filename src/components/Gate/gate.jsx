import SessionBox from "../SessionBox/sessionbox";
import "./gate.css";
import { useState } from "react";

const Gate = () => {
  const [mode, setMode] = useState("home");

  return (
    <div className="gate">
      <div className="button-row">
        <button onClick={() => setMode("join")}>Join Session</button>
        <button onClick={() => setMode("create")}>Create Session</button>
      </div>
      <SessionBox mode={mode} />
    </div>
  );
};

export default Gate;
