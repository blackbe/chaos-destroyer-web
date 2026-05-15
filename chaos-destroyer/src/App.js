import React from 'react';
import CommanderDeck from './components/CommanderDeck';
import CommanderDeckList from './components/CommanderDeckList';

const App = () => {
  const [deck, setDeck] = React.useState([
    { id: 'Atraxa, Praetors\'s Voice', commanderId: 'Atraxa, Praetors\'s Voice' },
    { id: 'Griselbrand', commanderId: 'Griselbrand' },
  ]);

  return (
    <div>
      <h1>Commander Deck Synergy Analyzer</h1>
      <CommanderDeck deck={deck} commanders={CommanderData} />
      <CommanderDeckList />
    </div>
  );
};

export default App;