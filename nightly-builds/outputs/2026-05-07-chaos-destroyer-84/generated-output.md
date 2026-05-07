[FILE: src/index.js]

// Import required modules
const express = require('express');
const app = express();
const fs = require('fs');

// Set up output path
const outputPath = '/Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-05-07-chaos-destroyer-84/';
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

// Function to render project roadmap page
async function renderProjectRoadmap() {
  // Get current date and time
  const now = new Date();

  // Load data from JSON file
  try {
    const data = await fs.promises.readFile('data.json', 'utf8');
    const jsonData = JSON.parse(data);

    // Render project roadmap template
    const html = `
      <html>
        <body>
          <h1>Project Roadmap</h1>
          <ul>
            ${jsonData.netflixJobTimeline.map((item) => `<li>${item.title}</li>`).join('')}
          </ul>
          <div id="hug-back"></div>
          <script>
            const hugBack = {
              title: 'HugBack Launch',
              dueDate: new Date('2026-06-15'),
              learningGoals: ['Improve SEO optimization']
            };

            // Render HugBack section
            document.getElementById('hug-back').innerHTML += `
              <div class="card">
                <span>${hugBack.title}</span>
                <p>Due Date: ${new Date(hugBack.dueDate).toLocaleDateString()}</p>
                <ul>
                  ${hugBack.learningGoals.map((item) => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `;
          </script>
        </body>
      </html>
    `;

    // Save HTML to file
    await fs.promises.writeFile(`${outputPath}index.html`, html);
  } catch (error) {
    console.error(error);
  }
}

// Route for project roadmap page
app.get('/', renderProjectRoadmap);

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

[FILE: src/data.json]

{
  "netflixJobTimeline": [
    { title: 'Project Planning', dueDate: '2026-05-31' },
    { title: 'Project Development', dueDate: '2026-06-15' },
    { title: 'Testing and Debugging', dueDate: '2026-06-29' }
  ],
  "hugBackLaunch": {
    title: 'HugBack Launch',
    dueDate: '2026-06-15',
    learningGoals: ['Improve SEO optimization']
  }
}

[FILE: src/css/index.css]

body {
  font-family: Arial, sans-serif;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  background-color: #f2f2f2;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.card {
  width: 50%;
  height: auto;
  margin: 20px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card span {
  font-size: 18px;
  font-weight: bold;
}

[FILE: src/README.md]

# Personal Project Roadmap v2

This is a personal project roadmap tool that helps Ben organize his life and projects.

## How to Use It

1. Run the application by executing `node src/index.js` in your terminal.
2. Open a web browser and navigate to `http://localhost:3000`.
3. The application will render a project roadmap page with timelines for Netflix job and HugBack launch, as well as learning goals.

## Integration Steps

1. Clone the repository by executing `git clone https://github.com/benblack/chaos-destroyer.git` in your terminal.
2. Navigate to the cloned repository by executing `cd chaos-destroyer`.
3. Run the application by executing `node src/index.js` in your terminal.

## Setup

1. Install dependencies by executing `npm install` in your terminal.
2. Create a new JSON file named `data.json` in the root directory of the project and add your data to it.

[FILE: src/log.js]

// Log function
function log(message) {
  console.log(message);
}

// Error handler for async/await
async function handleError(error) {
  log(`Error occurred: ${error.message}`);
}

module.exports = { log, handleError };
