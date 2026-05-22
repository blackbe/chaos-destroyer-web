import React from 'react';

function WCScheduleList() {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      // Simulate fetching events from an API or database
      const response = await fetch('https://example.com/wcschedule');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>West Coast Swing Events</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <span>{event.name}</span>
            <button onClick={() => console.log(event)}>View Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WCScheduleList;