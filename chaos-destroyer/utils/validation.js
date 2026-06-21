function validateInput(input) {
  if (!input.title || !input.author) {
    throw new Error('Title and author are required');
  }
}

module.exports = { validateInput };