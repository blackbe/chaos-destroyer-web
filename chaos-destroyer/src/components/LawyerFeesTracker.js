import React, { useState } from 'react';
import Tracker from './Tracker';

function LawyerFeesTracker() {
    const [lawyerFeesData, setLawyerFeesData] = useState({
        balance: 0,
        count: 0,
    });

    return (
        <div>
            <h2>Lawyer Fees</h2>
            <Tracker data={lawyerFeesData} />
            <button onClick={() => updateLawyerFeesData({ balance: 1000, count: 5 })}>
                Update Lawyer Fees Data
            </button>
        </div>
    );
}

function updateLawyerFeesData(data) {
    setLawyerFeesData(data);
}

export default LawyerFeesTracker;