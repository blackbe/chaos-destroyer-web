// Log function
function log(message) {
  console.log(message);
}

// Error handler for async/await
async function handleError(error) {
  log(`Error occurred: ${error.message}`);
}

module.exports = { log, handleError };