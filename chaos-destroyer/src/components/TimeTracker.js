import React, { useState } from 'react';

const TimeTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const startTimeTracker = async () => {
    if (isTracking) return;
    setStartTime(new Date().getTime());
    console.log('Start tracking time...');
    setIsTracking(true);
  };

  const endTimeTracker = async () => {
    if (!isTracking) return;
    const end_time = new Date().getTime();
    console.log(`End tracking time... ${end_time - start_time}ms`);
    setIsTracking(false);
  };

  return (
    <section>
      <button id="start-button" onClick={startTimeTracker}>
        {isTracking ? 'Stop' : 'Start'}
      </button>
      <button id="stop-button" onClick={endTimeTracker}>
        Stop
      </button>
    </section>
  );
};

export default TimeTracker;