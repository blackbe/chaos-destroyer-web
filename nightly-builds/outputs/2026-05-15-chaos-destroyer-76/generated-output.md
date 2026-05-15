[FILE: src/components CommanderDeck.js]
```javascript
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
```

[FILE: src/utils/CommanderData.js]
```javascript
const commanderData = {
  'Atraxa, Praetors's Voice': {
    id: 'Atraxa, Praetors\'s Voice',
    name: 'Atraxa, Praetors\'s Voice',
    manaCost: '{1}{W}',
    loyalty: 4,
  },
  'Griselbrand': {
    id: 'Griselbrand',
    name: 'Griselbrand',
    manaCost: '{2}{B}',
    loyalty: 2,
  },
  // Add more commander data here...
};

export default commanderData;
```

[FILE: src/components/CommanderDeckList.js]
```javascript
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
```

[FILE: src/App.js]
```javascript
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
```

[FILE: src/index.js]
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

README.md:
---

# Commander Deck Synergy Analyzer

A tool to analyze the synergy of commander decks in Magic: The Gathering.

## How to use:

1. Clone this repository and install the dependencies.
2. Run `npm start` to launch the application.
3. Open the browser and navigate to `http://localhost:3000`.

## Integration steps:

* This project uses React as the frontend framework.
* It relies on the `CommanderData` utility file for retrieving commander data.

## Setup needed:

* Install Node.js and npm (the package manager) if you haven't already.
* Clone this repository using Git: `git clone https://github.com/minimi/chaos-destroyer.git`
* Navigate to the project directory: `cd chaos-destroyer`
* Run `npm install` to install dependencies.
* Run `npm start` to launch the application.

## Usage examples:

The tool provides a simple interface for viewing and analyzing commander decks. It displays a list of cards in the deck, along with their mana costs and loyalty values. You can use this information to identify potential synergy issues or opportunities.

This project demonstrates a basic implementation of a web application using React. It includes essential features such as state management, rendering, and event handling. However, it is meant for educational purposes only and should not be used in production without further testing and debugging.
