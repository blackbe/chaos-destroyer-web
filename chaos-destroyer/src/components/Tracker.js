import React from 'react';

function Tracker({ data }) {
    return (
        <div>
            <h2>{data.name}</h2>
            <p>Balance: ${data.balance}</p>
            <p>Progress: {data.progress}%</p>
        </div>
    );
}

export default Tracker;