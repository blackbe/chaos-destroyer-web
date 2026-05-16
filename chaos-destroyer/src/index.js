import React from 'react';
import JournalTable from './components/JournalTable';

const App = () => {
  return (
    <div>
      <h1>ADHD & energy management journal</h1>
      <JournalTable />
      <button id="save-button">Save</button>
      <button id="load-button">Load</button>
    </div>
  );
};

export default App;
