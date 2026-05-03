import React, { useState } from 'react';
import Tracker from './Tracker';

function CreditCardProgressTracker() {
    const [creditCardProgressData, setCreditCardProgressData] = useState({
        balance: 2000,
        progress: 50,
    });

    return (
        <div>
            <h2>Credit Card Progress</h2>
            <Tracker data={creditCardProgressData} />
            <button onClick={() => updateCreditCardProgressData({ balance: 1000, progress: 25 })}>
                Update Credit Card Progress Data
            </button>
        </div>
    );
}

function updateCreditCardProgressData(data) {
    setCreditCardProgressData(data);
}

export default CreditCardProgressTracker;