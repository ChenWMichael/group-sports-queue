import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./queue.css";
import PropTypes from "prop-types";

const Queue = ({ items, setItems, sessionId }) => {
  const [inputValue, setInputValue] = useState("");

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    updateQueueInBackend(newItems);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const addItemToEndOfQueue = () => {
    if (!inputValue.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      content: inputValue,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    updateQueueInBackend(newItems);
    setInputValue("");
  };

  const handleDeleteItem = async (index) => {
    const updatedQueue = items.filter((_, i) => i !== index);
    setItems(updatedQueue);
    updateQueueInBackend(updatedQueue);
  };

  const updateQueueInBackend = async (newQueue) => {
    try {
      const response = await fetch(`/api/session/${sessionId}/queue/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue: newQueue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update queue");
      }
    } catch (error) {
      console.error("Error updating queue:", error);
    }
  };

  const formatDateToPST = (id) => {
    const timestamp = parseInt(id.split("-")[1]);
    const date = new Date(timestamp);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    };
    return date.toLocaleString("en-US", options);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addItemToEndOfQueue();
    }
  };

  return (
    <div className="queue-container">
      <h2 className="queue-header">Queue</h2>
      <h3 className="queue-members-count">Total: {items.length}</h3>
      <div className="add-member-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Enter name"
          className="add-member-input"
        />
        <button onClick={addItemToEndOfQueue} className="add-member-button">
          Add Member
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="queue-list"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="queue-item"
                    >
                      {index + 1}. {item.content}
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="delete-button"
                      >
                        X
                      </button>
                      <div className="queue-item-date">
                        {formatDateToPST(item.id)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

Queue.propTypes = {
  items: PropTypes.array.isRequired,
  setItems: PropTypes.func.isRequired,
  sessionId: PropTypes.string.isRequired,
};

export default Queue;
