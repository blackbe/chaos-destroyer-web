# Therapy Session Insight Extractor - Project #72

I'll build a complete therapy session insight tracker for Ben that parses notes, tracks progress on self-confidence and ADHD, and provides actionable insights.

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-04-20-chaos-destroyer-72/README.md]
```markdown
# Therapy Session Insight Extractor

A personal tool to parse therapy session notes, extract key insights, and track progress on self-confidence and ADHD management.

## What This Does

- **Session Note Parser**: Extracts themes, emotions, breakthroughs, and action items from raw therapy notes
- **Progress Tracking**: Monitors self-confidence levels and ADHD management techniques week-over-week
- **Insight Dashboard**: Visual summaries of patterns, wins, and areas to focus on
- **Trend Analysis**: Shows progress over time with charts and statistics
- **Action Item Manager**: Tracks homework/commitments from sessions

## Files Included

1. `therapy-tracker.js` - Core parsing and data management engine
2. `dashboard.html` - Interactive web dashboard with charts
3. `cli.js` - Command-line tool for quick note entry
4. `sample-data.json` - Example therapy sessions for testing
5. `insights.js` - Algorithms for pattern detection and progress analysis
6. `schema.md` - Data structure documentation

## Quick Start

### 1. Add a New Session

```bash
node cli.js add "2026-04-20" "Session with Dr. Sarah. Discussed anxiety about presentations and new ADHD medication. Practiced grounding technique."
```

### 2. View Dashboard

```bash
# Open in browser
open dashboard.html
```

Or serve it locally:
```bash
python3 -m http.server 8000
# Visit http://localhost:8000/dashboard.html
```

### 3. Get Progress Report

```bash
node cli.js report --weeks 4
```

## Data Structure

Sessions are stored in `sessions.json`:

```json
{
  "sessions": [
    {
      "id": "session-2026-04-20",
      "date": "2026-04-20",
      "raw_notes": "...",
      "themes": ["anxiety", "ADHD"],
      "self_confidence": 6,
      "adhd_focus": 7,
      "breakthroughs": ["Realized I'm harder on myself than others"],
      "action_items": ["Practice grounding 3x daily"],
      "emotions": ["anxious", "hopeful"],
      "techniques_practiced": ["grounding", "breathing"],
      "parsed_at": "2026-04-20T10:30:00Z"
    }
  ]
}
```

## Integration

### With Calendar
- Sessions are timestamped; import dates into your calendar system
- Use `export-ics.js` to generate .ics calendar file

### With Email
- CLI tool can email weekly summaries
- Edit `cli.js` EMAIL_CONFIG for SMTP setup

### With Note-Taking (Obsidian, Notion)
- Export to markdown: `node cli.js export markdown`
- Sync to cloud storage: `node cli.js sync`

## Commands

```bash
# Add session
node cli.js add <date> <notes>

# View session
node cli.js view <session-id>

# List all sessions
node cli.js list

# Get progress report (last N weeks)
node cli.js report --weeks 4

# Export data
node cli.js export <format>  # json, markdown, csv

# Analyze patterns
node cli.js analyze

# Clear old data (archive)
node cli.js archive --before 2026-01-01
```

## Customization

### Edit Theme Keywords
Update `CONFIDENCE_KEYWORDS` and `ADHD_KEYWORDS` in `insights.js` to match your therapeutic focus areas.

### Change Scoring Scale
Modify `RATING_SCALE` (default 1-10) in `therapy-tracker.js`.

### Add Custom Metrics
In `schema.md`, extend session object with new fields like `anxiety_level`, `medication_effectiveness`, etc.

## Files to Create/Update

Before first use:
1. Create `sessions.json` (auto-created on first run)
2. Create `config.json` for personal preferences
3. Run `node cli.js list` to initialize

## Tips for Best Results

1. **Be Specific**: Use concrete examples in notes, not just feelings
2. **Rate Yourself**: Always include confidence/focus ratings (1-10)
3. **Consistent Format**: Follow the template in `cli.js` for better parsing
4. **Review Weekly**: Run `node cli.js report --weeks 1` every Sunday
5. **Export Monthly**: Backup and archive sessions monthly

## Privacy & Security

- All data stored locally in `sessions.json`
- No cloud sync by default (optional via `sync` command)
- Add `.gitignore` entry: `sessions.json` if using version control
- Encrypt with: `node cli.js encrypt <password>` (requires bcrypt)

## Troubleshooting

**Q: Notes not parsing correctly?**
- Use clear, specific language
- Include therapy techniques by name
- Add ratings explicitly: "Self-confidence: 7/10"

**Q: Dashboard not loading?**
- Check `sessions.json` exists and is valid JSON
- Open browser console (F12) for errors
- Try: `node validate.js`

**Q: Missing insights?**
- Run `node cli.js analyze --verbose`
- Ensure at least 3 sessions for trend analysis
- Check keywords match your session content

## Future Enhancements

- [ ] Mobile app version
- [ ] Integration with therapy provider (secure)
- [ ] Voice note transcription
- [ ] Medication tracking sync
- [ ] Goal setting & tracking
- [ ] Export to therapist (PDF report)

---

**Built with ❤️ for Ben's chaos destruction.**
```

---

```
[FILE: /Users/benblack/.openclaw/workspace/nightly-builds/outputs/2026-04-20-chaos-destroyer-72/therapy-tracker.js]
```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = './sessions.json';
const CONFIG_FILE = './config.json';
const RATING_SCALE = 10;

class TherapyTracker {
  constructor() {
    this.sessions = [];
    this.config = this.loadConfig();
    this.loadSessions();
  }

  // Load existing sessions or create new file
  loadSessions() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        this.sessions = parsed.sessions || [];
      }
    } catch (error) {
      console.error(`Error loading sessions: ${error.message}`);
      this.sessions = [];
    }
  }

  // Load configuration
  loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      } catch {
        return this.defaultConfig();
      }
    }
    return this.defaultConfig();
  }

  defaultConfig() {
    return {
      therapist_name: 'Dr. Sarah',
      session_frequency: 'weekly',
      focus_areas: ['self-confidence', 'ADHD', 'anxiety'],
      rating_scale: RATING_SCALE,
      backup_enabled: true,
      theme: 'dark'
    };
  }

  // Save sessions to file
  saveSessions() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ sessions: this.sessions }, null, 2));
      this.createBackup();
      return true;
    } catch (error) {
      console.error(`Error saving sessions: ${error.message}`);
      return false;
    }
  }

  // Create automatic backup
  createBackup() {
    if (!this.config.backup_enabled) return;
    try {
      const backupDir = './backups';
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const backupFile = path.join(backupDir, `sessions-${timestamp}.json`);
      
      if (!fs.existsSync(backupFile)) {
        fs.copyFileSync(DATA_FILE, backupFile);
      }
    } catch (error) {
      console.warn(`Backup failed: ${error.message}`);
    }
  }

  // Create new session
  createSession(date, rawNotes, ratings = {}) {
    const sessionId = `session-${date}`;
    
    // Check for duplicates
    if (this.sessions.find(s => s.id === sessionId)) {
      throw new Error(`Session already exists for ${date}`);
    }

    const session = {
      id: sessionId,
      date: date,
      timestamp: new Date().toISOString(),
      raw_notes: rawNotes,
      themes: [],
      self_confidence: ratings.self_confidence || null,
      adhd_focus: ratings.adhd_focus || null,
      breakthroughs: [],
      action_items: [],
      emotions: [],
      techniques_practiced: [],
      medication_notes: ratings.medication_notes || null,
      parsed_at: new Date().toISOString(),
      tags: ratings.tags || []
    };

    // Parse the notes
    this.parseNotes(session);

    this.sessions.push(session);
    this.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (this.saveSessions()) {
      return session;
    }
    throw new Error('Failed to save session');
  }

  // Extract structured data from notes
  parseNotes(session) {
    const notes = session.raw_notes.toLowerCase();

    // Extract emotions
    const emotionKeywords = {
      anxious: ['anxious', 'anxiety', 'worried', 'nervous'],
      hopeful: ['hopeful', 'optimistic', 'positive', 'encouraged'],
      frustrated: ['frustrated', 'angry', 'upset', 'irritated'],
      sad: ['sad', 'depressed', 'down', 'blue'],
      confident: ['confident', 'strong', 'capable', 'proud'],
      overwhelmed: ['overwhelmed', 'stressed', 'flooded', 'swamped'],
      calm: ['calm', 'peaceful', 'zen', 'relaxed']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(kw => notes.includes(kw))) {
        if (!session.emotions.includes(emotion)) {
          session.emotions.push(emotion);
        }
      }
    });

    // Extract techniques
    const techniqueKeywords = {
      grounding: ['grounding', '5-4-3-2-1', 'ground myself', 'grounding technique'],
      breathing: ['breathing', 'breathe', 'box breathing', 'deep breath'],
      mindfulness: ['mindfulness', 'meditation', 'present', 'awareness'],
      journaling: ['journal', 'writing', 'wrote'],
      exercise: ['exercise', 'workout', 'yoga', 'walking'],
      social: ['talking', 'reached out', 'friend', 'connection'],
      therapy_skills: ['cbt', 'exposure', 'challenge', 'thought record']
    };

    Object.entries(techniqueKeywords).forEach(([technique, keywords]) => {
      if (keywords.some(kw => notes.includes(kw))) {
        if (!session.techniques_practiced.includes(technique)) {
          session.techniques_practiced.push(technique);
        }
      }
    });

    // Extract themes
    const themeKeywords = {
      'self-confidence': ['confidence', 'self-worth', 'self esteem', 'belief'],
      'ADHD': ['adhd', 'focus', 'attention', 'distraction', 'executive function'],
      'anxiety': ['anxiety', 'anxious', 'panic', 'worry'],
      'relationships': ['relationship', 'friend', 'family', 'social'],
      'work': ['work', 'job', 'career', 'boss', 'project'],
      'sleep': ['sleep', 'sleeping', 'insomnia', 'rest'],
      'medication': ['medication', 'med', 'pill', 'dose'],
      'perfectionism': ['perfect', 'perfectionism', 'mistakes', 'failure']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(kw => notes.includes(kw))) {
        if (!session.themes.includes(theme)) {
          session.themes.push(theme);
        }
      }
    });

    // Extract action items
    const actionPatterns = [
      /(?:do|try|practice)\s+(.+?)(?:\.|,|;|next time)/gi,
      /homework[:\s]+(.+?)(?:\.|,|;|next)/gi,
      /action item[:\s]+(.+?)(?:\.|,|;|next)/gi
    ];

    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(session.raw_notes)) !== null) {
        const action = match[1].trim();
        if (action.length > 5 && !session.action_items.includes(action)) {
          session.action_items.push(action);
        }
      }
    });

    // Extract breakthroughs
    const breakthroughPatterns = [
      /(?:realized|breakthrough|insight|discovered)\s+(.+?)(?:\.|,|;|and)/gi,
      /aha[:\s]+(.+?)(?:\.|,|;|and)/gi
    ];

    breakthroughPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(session.raw_notes)) !== null) {
        const insight = match[1].trim();
        if (insight.length > 5 && !session.breakthroughs.includes(insight)) {
          session.breakthroughs.push(insight);
        }
      }
    });
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  }

  // Get all sessions
  getAllSessions() {
    return this.sessions;
  }

  // Get sessions from last N weeks
  getSessionsLastNWeeks(weeks) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

    return this.sessions.filter(s => new Date(s.date) >= cutoffDate);
  }

  // Get sessions from date range
  getSessionsInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= start && sessionDate <= end;
    });
  }

  // Update session
  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key === 'raw_notes') {
        session.raw_notes = updates[key];
        this.parseNotes(session); // Re-parse if notes changed
      } else if (session.hasOwnProperty(key)) {
        session[key] = updates[key];
      }
    });

    session.updated_at = new Date().toISOString();
    
    if (this.saveSessions()) {
      return session;
    }
    throw
