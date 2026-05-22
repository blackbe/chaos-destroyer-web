import React from 'react';
import WCSchedule from './components/WCSchedule';
import WCScheduleList from './components/WCScheduleList';

function App() {
  return (
    <div>
      <h1>Weekend Social Calendar</h1>
      <WCSchedule />
      <WCScheduleList />
    </div>
  );
}

export default App;