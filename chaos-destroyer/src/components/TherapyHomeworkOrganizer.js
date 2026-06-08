import React, { useState, useEffect } from 'react';
import './TherapyHomeworkOrganizer.css';

const TherapyHomeworkOrganizer = () => {
  const [assignments, setAssignments] = useState([]);
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [insights, setInsights] = useState([]);

  // Fetch assignments from backend (mocked for now)
  useEffect(() => {
    const fetchAssignments = async () => {
      const response = await fetch('/api/assignments');
      const data = await response.json();
      setAssignments(data);
    };
    fetchAssignments();
  }, []);

  const handleAddAssignment = (assignment) => {
    setAssignments([...assignments, assignment]);
  };

  const handleLogPractice = (log) => {
    setPracticeLogs([...practiceLogs, log]);
  };

  const handleCaptureInsight = (insight) => {
    setInsights([...insights, insight]);
  };

  return (
    <div className="therapy-homework-organizer">
      <h1>Therapy Homework Organizer</h1>
      <section className="assignments">
        <h2>Upcoming Assignments:</h2>
        {assignments.map((assignment) => (
          <p key={assignment.id}>{assignment.name} - Due: {assignment.dueDate}</p>
        ))}
      </section>
      <section className="practice-logs">
        <h2>Practice Log Entries:</h2>
        <button className="add-log-button">Add New Entry</button>
        {practiceLogs.map((log, index) => (
          <div key={index}>
            <p>
              Description: {log.description}
              <br />
              Mood Rating (1-5): {log.moodRating}
              <br />
              Duration: {log.duration} minutes
            </p>
            <button onClick={() => handleLogPractice(log)}>Edit</button>
          </div>
        ))}
      </section>
      <section className="insights">
        <h2>Insight Capture:</h2>
        <form>
          <label>Tag:*</label>
          <select value={insight.tag} onChange={(e) => setInsight({ ...insight, tag: e.target.value })}>
            <option value="">Select a tag</option>
            <option value="ADHD">ADHD</option>
            <option value="self-confidence">Self-Confidence</option>
            <option value="childhood trauma">Childhood Trauma</option>
          </select>
          <br />
          <label>Insight:</label>
          <textarea value={insight.insight} onChange={(e) => setInsight({ ...insight, insight: e.target.value })} />
        </form>
        <button onClick={() => handleCaptureInsight(insight)}>Save Insight</button>
      </section>
      <section className="progress-visualization">
        <h2>Progress Visualization:</h2>
        <canvas id="progress-bar"></canvas>
      </section>
    </div>
  );
};

export default TherapyHomeworkOrganizer;