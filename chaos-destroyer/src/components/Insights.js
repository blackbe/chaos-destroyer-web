
import React from 'react';
import { useState } from 'react';

const Insights = () => {
  const [tags, setTags] = useState([]);
  const [insights, setInsights] = useState([]);

  const handleTagChange = (event) => {
    if (!tags.includes(event.target.value)) {
      setTags([...tags, event.target.value]);
    }
  };

  const handleAddInsight = () => {
    // Handle add insight button click
  };

  return (
    <div>
      <h1>Insights</h1>
      <select onChange={handleTagChange}>
        {tags.map((tag) => (
          <option key={tag}>{tag}</option>
        ))}
      </select>
      <button onClick={handleAddInsight}>Add Insight</button>
      <ul>
        {insights.map((insight, index) => (
          <li key={index}>
            <span>{insight.tag}</span>: <span>{insight.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Insights;