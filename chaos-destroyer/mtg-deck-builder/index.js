/**
 * MTG deck builder assistant
 */

const fs = require('fs');
const path = require('path');

function main() {
  const cardListPath = 'mtg-deck-builder/card-list.txt';

  if (!fs.existsSync(cardListPath)) {
    console.error('Card list file not found!');
    return;
  }

  const cardDataFile = require('./card-data.json');
  const deckBuilder = require('./deck-builder.js');

  // Load the card list from the file
  const cardList = fs.readFileSync(cardListPath, 'utf8').split('\n').filter(line => line.trim());

  // Build a new deck using the loaded card list
  const deck = deckBuilder.buildDeck(cardList);

  // Get synergy suggestions and cost analysis for the deck
  const synergySuggestions = deckBuilder.getSynergySuggestions(deck);
  const costAnalysis = deckBuilder.getCostAnalysis(deck);

  console.log('Deck:');
  console.log(deck);
  console.log(`\nSynergy Suggestions:`);
  console.log(synergySuggestions);
  console.log(`\nTotal Mana Cost: ${costAnalysis.totalManaCost}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
