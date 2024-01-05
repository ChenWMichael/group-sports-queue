import "./court.css";
import PropTypes from "prop-types";
import { useState } from "react";

const Court = ({ courtId, players, onRemoveAllPlayers, onRemoveCourt }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemoveCourt = () => {
    if (players.length === 0) {
      onRemoveCourt(courtId);
    } else {
      alert("Empty the court first.");
    }
  };

  return (
    <div className="court">
      <h3 onClick={() => setShowConfirm(true)}>Court {courtId}</h3>
      {showConfirm && (
        <div className="court-remove-confirm">
          <p>Remove Court {courtId}?</p>
          <button onClick={handleRemoveCourt}>Confirm</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
      <ul className="court-list">
        {players.map((player, index) => (
          <li key={index} className="court-item">
            {player.content}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onRemoveAllPlayers(courtId)}
        className="empty-court-button"
      >
        Empty Court
      </button>
    </div>
  );
};

Court.propTypes = {
  courtId: PropTypes.number.isRequired,
  players: PropTypes.array.isRequired,
  onRemoveAllPlayers: PropTypes.func.isRequired,
  onRemoveCourt: PropTypes.func.isRequired,
};

export default Court;
