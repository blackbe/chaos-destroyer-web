const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let lawyerFeesTracker = {
    total: 0,
    count: 0,
};

let momLoanPayoffTracker = {
    balance: 0,
    paymentCount: 0,
    paymentDate: new Date(),
};

let creditCardProgressTracker = {
    balance: 0,
    progress: 0,
};

// Get data from Ben's file system
async function loadTrackers() {
    try {
        const lawyerFeesData = await readDataFromFile(
            '/Users/benblack/.openclaw/workspace/chaos-destroyer/data/lawyer-fees.json'
        );
        const momLoanPayoffData = await readDataFromFile(
            '/Users/benblack/.openclaw/workspace/chaos-destroyer/data/mom-loan-payoff.json'
        );
        const creditCardProgressData = await readDataFromFile(
            '/Users/benblack/.openclaw/workspace/chaos-destroyer/data/credit-card-progress.json'
        );

        lawyerFeesTracker.total = lawyerFeesData.balance;
        lawyerFeesTracker.count = lawyerFeesData.count;

        momLoanPayoffTracker.balance = momLoanPayoffData.balance;
        momLoanPayoffTracker.paymentCount = momLoanPayoffData.paymentCount;
        momLoanPayoffTracker.paymentDate = new Date(momLoanPayoffData.paymentDate);

        creditCardProgressTracker.balance = creditCardProgressData.balance;
        creditCardProgressTracker.progress = creditCardProgressData.progress;

    } catch (error) {
        console.error('Error loading trackers:', error);
    }
}

function readDataFromFile(filePath) {
    return new Promise((resolve, reject) => {
        // Simulate reading data from a file
        const data = {
            balance: 1000,
            count: 5,
            paymentDate: '2022-01-01',
        };

        resolve(data);
    });
}

function calculatePaymentProgress() {
    return (momLoanPayoffTracker.balance / momLoanPayoffTracker.paymentCount) * 100;
}

// API endpoint to get tracker data
app.get('/trackers', async (req, res) => {
    await loadTrackers();

    const lawyerFeesData = JSON.stringify(lawyerFeesTracker);
    const momLoanPayoffData = JSON.stringify(momLoanPayoffTracker);
    const creditCardProgressData = JSON.stringify(creditCardProgressTracker);

    res.json({
        lawyerFees: lawyerFeesData,
        momLoanPayoff: momLoanPayoffData,
        creditCardProgress: creditCardProgressData,
    });
});

// API endpoint to update payment count
app.post('/trackers/mom-loan-payoff', async (req, res) => {
    try {
        const { paymentCount } = req.body;
        momLoanPayoffTracker.paymentCount += paymentCount;

        // Update the balance based on the new payment count
        momLoanPayoffTracker.balance = calculatePaymentProgress();
        app.emit('paymentProgressUpdated', momLoanPayoffTracker.progress);

        res.json({ message: 'Payment count updated successfully' });
    } catch (error) {
        console.error('Error updating payment count:', error);
        res.status(500).json({ message: 'Failed to update payment count' });
    }
});

// API endpoint to calculate payment progress
app.get('/trackers/progress', async (req, res) => {
    try {
        const progress = calculatePaymentProgress();
        res.json({ progress });
    } catch (error) {
        console.error('Error calculating payment progress:', error);
        res.status(500).json({ message: 'Failed to calculate payment progress' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});