import React, { useState } from 'react';
import Tracker from './Tracker';

function MomLoanPayoffTracker() {
    const [momLoanPayoffData, setMomLoanPayoffData] = useState({
        balance: 50000,
        paymentCount: 10,
        paymentDate: '2022-01-01',
    });

    return (
        <div>
            <h2>Mom Loan Payoff</h2>
            <Tracker data={momLoanPayoffData} />
            <button onClick={() => updateMomLoanPayoffData({ balance: 0, paymentCount: 1 })}>
                Update Mom Loan Payoff Data
            </button>
        </div>
    );
}

function updateMomLoanPayoffData(data) {
    setMomLoanPayoffData(data);
}

export default MomLoanPayoffTracker;