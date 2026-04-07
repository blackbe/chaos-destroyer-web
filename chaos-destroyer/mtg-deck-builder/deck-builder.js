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
