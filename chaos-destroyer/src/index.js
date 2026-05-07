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