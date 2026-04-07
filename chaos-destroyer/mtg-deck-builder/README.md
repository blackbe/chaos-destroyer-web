# MTG Deck Builder Assistant

A Node.js utility to help build Magic: The Gathering decks, analyze synergies, and calculate mana curves.

## Features

- **Parse card lists** from text files
- **Suggest synergies** between cards (color matching, stat alignment)
- **Cost analysis** - Calculate total mana cost of your deck
- **Deck building** - Build a 60-card deck from your card list

## Usage

1. **Create a card list** in `card-list.txt`:
   ```
   Black Lotus
   Mountain
   Lightning Bolt
   Counterspell
   Wrath of God
   ```

2. **Run the builder**:
   ```bash
   node index.js
   ```

3. **Output** will show:
   - Your deck composition
   - Synergy suggestions (cards that work well together)
   - Total mana cost

## File Structure

- `deck-builder.js` - Core deck building logic
- `card-data.json` - Sample card database
- `index.js` - CLI entry point
- `card-list.txt` - Your custom card list (edit this for your deck)
- `README.md` - This file

## How It Works

### Synergy Detection
The builder identifies synergies by:
- Matching card colors
- Checking mana cost thresholds (≤3)
- Validating power/toughness stats (≥2/2)

### Cost Analysis
Sums the mana cost of all cards in the deck.

### Deck Building
Automatically selects up to 60 cards from your list, avoiding duplicates.

## Customization

Edit `card-data.json` to add more cards with stats:
```json
{
  "id": "4",
  "name": "Giant Growth",
  "manaCost": 1,
  "power": 0,
  "toughness": 0,
  "color": "green",
  "types": ["Instant"]
}
```

## Future Enhancements

- [ ] Import from Scryfall API
- [ ] Advanced synergy detection (tribal, mechanics)
- [ ] Mana curve visualization
- [ ] Deck export to MTGO format
- [ ] Hand smoothing simulator

---

**Built by:** Minimi's Nightly Builder  
**Task #51** - Chaos Destroyer Project
