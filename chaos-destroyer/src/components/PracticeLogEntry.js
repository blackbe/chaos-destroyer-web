
import React from 'react';
import { useState } from 'react';

const PracticeLogEntry = () => {
  const [description, setDescription] = useState('');
  const [moodRating, setMoodRating] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleFormChange = (event) => {
    if (event.target.name === 'description') {
      setDescription(event.target.value);
    } else if (event.target.name === 'mood-rating') {
      setMoodRating(parseInt(event.target.value));
    } else if (event.target.name === 'duration') {
      setDuration(parseInt(event.target.value));
    }
  };

  return (
    <form>
      <label>Description:</label>
      <input
        type="text"
        name="description"
        value={description}
        onChange={handleFormChange}
      />
      <br />
      <label>Mood Rating (1-5):</label>
      <input
        type="number"
        min="1"
        max="5"
        name="mood-rating"
        value={moodRating}
        onChange={handleFormChange}
      />
      <br />
      <label>Duration:</label>
      <input
        type="number"
        name="duration"
        value={duration}
        onChange={handleFormChange}
      />
      <br />
      <button>Submit</button>
    </form>
  );
};

export default PracticeLogEntry;