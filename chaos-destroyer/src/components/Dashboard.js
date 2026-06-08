
import React from 'react';
import { useState, useEffect } from 'react';
import { FetchData } from '../utils/helpers';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);

  useEffect(() => {
    FetchData('https://example.com/sessions.json')
      .then((data) => {
        setSessions(data.sessions);
        setUpcomingAssignments(data.upcomingAssignments);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleDateChange = (date) => {
    // Handle date change event
  };

  return (
    <div>
      <h1>Upcoming Assignments</h1>
      <ul>
        {upcomingAssignments.map((assignment, index) => (
          <li key={index}>
            <span>{assignment.date}</span>
            <span>{assignment.assignment}</span>
          </li>
        ))}
      </ul>
      <button onClick={handleDateChange}>View All Sessions</button>
    </div>
  );
};

export default Dashboard;