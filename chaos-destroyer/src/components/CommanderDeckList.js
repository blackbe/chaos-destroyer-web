import React from 'react';
import CommanderData from '../utils/CommanderData';

const CommanderDeckList = () => {
  const [deck, setDeck] = React.useState([
    { id: 'Atraxa, Praetors\'s Voice', commanderId: 'Atraxa, Praetors\'s Voice' },
    { id: 'Griselbrand', commanderId: 'Griselbrand' },
  ]);

  return (
    <ul>
      {deck.map((card) => {
        const matchingCommander = CommanderData[card.commanderId];
        return (
          <li key={card.id}>
            {matchingCommander.name} ({matchingCommander.manaCost})
          </li>
        );
      })}
    </ul>
  );
};

export default CommanderDeckList;