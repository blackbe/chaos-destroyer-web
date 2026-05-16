import React from 'react';

const JournalEntry = ({ entry }) => {
  return (
    <tr>
      <td>{entry.date}</td>
      <td>{entry.mood}</td>
      <td>{entry.focus}</td>
      <td>{entry.wins}</td>
      <td>{entry.blockers}</td>
    </tr>
  );
};

export default JournalEntry;
