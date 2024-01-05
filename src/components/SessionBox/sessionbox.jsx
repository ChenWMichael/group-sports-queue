import "./sessionbox.css";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SessionBox = ({ mode }) => {
  const [sessionId, setSessionId] = useState("");
  const [sessionName, setSessionName] = useState("");

  const navigate = useNavigate();

  const handleJoinSession = async (sessionId) => {
    console.log("Requesting session with ID:", sessionId);
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (response.ok) {
        navigate(`/session/${sessionId}`);
      } else {
        alert("Session ID not found. Please check the ID and try again.");
      }
    } catch (error) {
      console.error("Error verifying session:", error);
    }
  };

  const handleSessionIdChange = (event) => {
    setSessionId(event.target.value.toUpperCase());
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetch("/api/createSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: sessionName }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        navigate(`/session/${sessionId}`);
      } else {
        console.error("Failed to create session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  let content;

  switch (mode) {
    case "home":
      content = (
        <div>
          <h1 className="home-header">Welcome to Group Sports Queue</h1>
          <p className="home-paragraph">
            This application is a fun and interactive full-stack project
            designed to solve a specific challenge faced by my friend&#39;s
            badminton group. They needed an efficient way to manage and queue
            games, so I developed this tool to help them out. Despite the
            original idea of being badminton specific, I realized that it was
            applicable to many sports with large groups of people. It&#39;s a
            practical solution wrapped in a user-friendly interface. Enjoy
            exploring and using it!
          </p>
        </div>
      );
      break;
    case "join":
      content = (
        <div className="join-content">
          <h1 className="join-header">
            Enter <br />
            Session ID
          </h1>
          <input
            type="text"
            className="join-session-input"
            placeholder="Session ID"
            value={sessionId}
            onChange={handleSessionIdChange}
            maxLength={5}
          />
          <button
            className="join-button"
            onClick={() => handleJoinSession(sessionId)}
          >
            Join
          </button>
        </div>
      );
      break;
    case "create":
      content = (
        <div className="create-content">
          <h1 className="create-header">Creating Session</h1>
          <input
            type="text"
            className="create-session-name"
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <button className="create-button" onClick={handleCreateSession}>
            Create
          </button>
        </div>
      );
      break;
    default:
      content = <p>Welcome!</p>;
  }

  return <div className="session-box">{content}</div>;
};

SessionBox.propTypes = {
  mode: PropTypes.string.isRequired,
};

export default SessionBox;
