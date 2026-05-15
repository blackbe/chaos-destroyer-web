import React from 'react';

const CommanderDeck = ({ deck, commanders }) => {
  const renderCommanderCard = (commander) => {
    return (
      <div key={commander.id}>
        <h2>{commander.name}</h2>
        <p>Mana Cost: {commander.manaCost}</p>
        <p>Loyalty: {commander.loyalty}</p>
        <button onClick={() => console.log(commander)}>View Commander Info</button>
      </div>
    );
  };

  return (
    <div>
      <h1>Commander Deck Synergy Analyzer</h1>
      <ul>
        {deck.map((card) => {
          const matchingCommanders = commanders.filter(
            (commander) => commander.id === card.commanderId
          );
          return (
            <li key={card.id}>
              {renderCommanderCard(matchingCommanders[0])}
              <p>Card Type: {card.type}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CommanderDeck;