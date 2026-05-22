import React, { useState } from 'react';

function WCSchedule() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEventName = newEvent.trim();
    if (!newEventName) return;
    const newEventDate = new Date();
    setEvents([...events, { name: newEventName, date: newEventDate }]);
    setNewEvent('');
  };

  const handleDelete = (index) => {
    setEvents(events.slice(0, index).concat(events.slice(index + 1)));
  };

  return (
    <div>
      <h2>Weekend Social Calendar</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          placeholder="Enter event name"
        />
        <button type="submit">Add Event</button>
      </form>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <span>{event.name}</span>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WCSchedule;