import React from 'react';
import JournalEntry from './JournalEntry';

const JournalTable = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Mood</th>
          <th>Focus</th>
          <th>Wins</th>
          <th>Blockers</th>
        </tr>
      </thead>
      <tbody>
        {journal.getEntries().map((entry) => (
          <JournalEntry key={entry.id} entry={entry} />
        ))}
      </tbody>
    </table>
  );
};

export default JournalTable;
