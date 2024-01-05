import "./sessionpage.css";
import { useParams } from "react-router-dom";
import Queue from "../Queue/queue";
import { useEffect, useState } from "react";
import Court from "../Court/court";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const SessionPage = () => {
  const { sessionId } = useParams();
  const [sessionName, setSessionName] = useState("Loading session...");
  const [queueItems, setQueueItems] = useState([]);
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    socket.emit("joinSession", sessionId);

    socket.on("queueUpdated", (updatedQueue) => {
      setQueueItems(updatedQueue);
    });

    socket.on("courtsUpdated", (updatedCourts) => {
      setCourts(updatedCourts);
    });

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          setSessionName(sessionData.name);
          setQueueItems(sessionData.queue || []);
          setCourts(sessionData.courts || []);
        } else {
          console.error("Failed to fetch session");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();

    return () => {
      socket.off("queueUpdated");
      socket.off("courtsUpdated");
    };
  }, [sessionId]);

  const addCourt = async () => {
    const newCourt = { players: [] };
    const updatedCourts = [...courts, newCourt];

    try {
      const response = await fetch(`/api/session/${sessionId}/courts/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courts: updatedCourts, queue: queueItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to update courts");
      }

      const updatedData = await response.json();

      setCourts(updatedData.courts);
    } catch (error) {
      console.error("Error updating courts:", error);
    }
  };

  const removeCourt = async (courtId) => {
    const updatedCourts = courts.filter((court) => court.courtId !== courtId);
    try {
      const response = await fetch(
        `/api/session/${sessionId}/courts/remove/court`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courtId: courtId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove court");
      }

      setCourts(updatedCourts);
    } catch (error) {
      console.error("Error removing court:", error);
    }
  };

  const movePlayersToCourt = async () => {
    const targetCourtIndex = courts.findIndex(
      (court) => court.players.length < 4
    );

    if (targetCourtIndex === -1 || queueItems.length === 0) {
      return;
    }

    const spotsLeft = 4 - courts[targetCourtIndex].players.length;
    const playersToAdd = queueItems.slice(0, spotsLeft);
    const updatedQueue = queueItems.slice(spotsLeft);

    const updatedCourts = [...courts];
    updatedCourts[targetCourtIndex] = {
      ...updatedCourts[targetCourtIndex],
      players: [...updatedCourts[targetCourtIndex].players, ...playersToAdd],
    };

    try {
      const response = await fetch(`/api/session/${sessionId}/courts/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courts: updatedCourts, queue: updatedQueue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      setQueueItems(updatedQueue);
      setCourts(updatedCourts);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const removeAllPlayersFromCourt = async (courtId) => {
    const updatedCourts = courts.map((court) => {
      if (court.courtId === courtId) {
        setQueueItems([...queueItems, ...court.players]);
        return { ...court, players: [] };
      }
      return court;
    });

    const playersBeingRemoved = courts.find(
      (court) => court.courtId === courtId
    ).players;
    const updatedQueue = [...queueItems, ...playersBeingRemoved];

    try {
      const response = await fetch(`/api/session/${sessionId}/courts/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courts: updatedCourts, queue: updatedQueue }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove players from court");
      }

      setCourts(updatedCourts);
      setQueueItems(updatedQueue);
    } catch (error) {
      console.error("Error removing players from court:", error);
    }
  };

  return (
    <div className="session-page">
      <h1 className="session-page-header-name">
        {sessionName || "Loading session..."}
      </h1>
      <h2 className="session-page-header-id">Session ID: {sessionId}</h2>
      <button onClick={addCourt} className="add-court-button">
        Add Court
      </button>
      <button onClick={movePlayersToCourt} className="move-to-court-button">
        Move to Court
      </button>
      <div className="session-courts">
        {courts.map((court) => (
          <Court
            key={court.courtId}
            courtId={court.courtId}
            players={court.players}
            onRemoveAllPlayers={() => removeAllPlayersFromCourt(court.courtId)}
            onRemoveCourt={removeCourt}
          />
        ))}
      </div>
      <div className="session-queue">
        <Queue
          items={queueItems}
          setItems={setQueueItems}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
};

export default SessionPage;
