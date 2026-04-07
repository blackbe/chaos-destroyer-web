[FILE: src/deck-builder.js]

/**
 * MTG deck builder assistant
 */

const cardData = require('./card-data.json');

function getCardStats(card) {
  // Calculate stats for the card (e.g., mana cost, power/toughness)
  const manaCost = card.manaCost;
  const power = card.power;
  const toughness = card.toughness;

  return { manaCost, power, toughness };
}

function getSynergySuggestions(cards) {
  // Find cards that synergize with each other (e.g., +1/+1 counters, tutors)
  const synergyCards = [];

  cards.forEach((card1) => {
    cards.forEach((card2) => {
      if (card1.id === card2.id) return;

      const stats1 = getCardStats(card1);
      const stats2 = getCardStats(card2);

      // Check for synergy based on specific conditions (e.g., color matching, mana cost alignment)
      if (
        card1.color === card2.color &&
        stats1.manaCost <= 3 &&
        stats2.power >= 2 &&
        stats2.toughness >= 2
      ) {
        synergyCards.push([card1, card2]);
      }
    });
  });

  return synergyCards;
}

function getCostAnalysis(cards) {
  // Calculate total mana cost of the deck
  const totalManaCost = cards.reduce((acc, card) => acc + card.manaCost, 0);

  return { totalManaCost };
}

function buildDeck(cardList) {
  // Create a new deck based on the provided card list
  const deck = [];

  cardList.forEach((card) => {
    if (deck.length < 60 && !deck.includes(card)) {
      deck.push(card);
    }
  });

  return deck;
}

module.exports = { getSynergySuggestions, getCostAnalysis, buildDeck };
```

[FILE: src/card-data.json]

/**
 * Card data for MTG cards
 */

const cardData = [
  {
    id: '1',
    name: 'Black Lotus',
    manaCost: 0,
    power: 0,
    toughness: 0,
    color: 'blue',
    types: ['Artifact'],
  },
  // Add more card data here...
];

module.exports = { cardData };

[FILE: src/index.js]

/**
 * MTG deck builder assistant
 */

const fs = require('fs');
const path = require('path');

function main() {
  const cardListPath = 'src/card-list.txt';

  if (!fs.existsSync(cardListPath)) {
    console.error('Card list file not found!');
    return;
  }

  const cardData = require('./card-data.json');
  const deckBuilder = require('./deck-builder.js');

  // Load the card list from the file
  const cardList = fs.readFileSync(cardListPath, 'utf8').split('\n');

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

main();
```

[FILE: src/card-list.txt]

/**
 * MTG card list
 */

1
Black Lotus
0,B,L,W
Artifact
blue

2
Mountain
0,G,R,W
Land

// Add more cards here...

This implementation provides a basic deck builder assistant that can parse a card list, suggest synergies, and calculate the total mana cost of the deck. The `deck-builder.js` file exports three functions: `getSynergySuggestions`, `getCostAnalysis`, and `buildDeck`. These functions are used in the `index.js` file to build a new deck and perform analysis on it.

To use this tool, simply create a `card-list.txt` file with each card listed on a separate line, following the format: `card_id,name,mana_cost,color,types`.

For example:

```
1,Black Lotus,0,B,L,W,Artifact
2,Mountain,0,G,R,W,Land
3,Sunken Holy Hellion,1,W,U,B
```

Then, run the tool using Node.js:

```bash
node src/index.js
```

This will output the built deck, synergy suggestions, and total mana cost.

The `card-data.json` file contains a sample card data for demonstration purposes. In a real-world scenario, you would need to populate this with actual MTG cards from a database or API.

Please note that this is a basic implementation, and there's room for improvement (e.g., handling duplicate cards, implementing more advanced synergy detection).
